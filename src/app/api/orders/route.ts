import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, isMongoDBConfigured, getLastMongoError } from '@/lib/mongodb';
import { Order } from '@/types/product';
import { initialMockOrders } from '@/utils/orderStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');

    if (!isMongoDBConfigured()) {
      let result = initialMockOrders;
      if (emailParam) {
        const clean = emailParam.toLowerCase().trim();
        result = result.filter(o => o.email && o.email.toLowerCase().trim() === clean);
      }
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        dbError: getLastMongoError(),
        orders: result,
      });
    }

    const db = await getDatabase();
    if (!db) {
      let result = initialMockOrders;
      if (emailParam) {
        const clean = emailParam.toLowerCase().trim();
        result = result.filter(o => o.email && o.email.toLowerCase().trim() === clean);
      }
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        dbError: getLastMongoError(),
        orders: result,
      });
    }

    const collection = db.collection<Order>('orders');
    
    // Auto-seed mock orders if collection has 0 orders
    const count = await collection.countDocuments();
    if (count === 0) {
      try {
        await collection.insertMany(initialMockOrders as any);
      } catch (seedErr) {
        console.error('Error auto-seeding orders:', seedErr);
      }
    }

    let orders = await collection.find({}).sort({ _id: -1 }).toArray();

    if (emailParam) {
      const cleanEmail = emailParam.toLowerCase().trim();
      orders = orders.filter(o => o.email && o.email.toLowerCase().trim() === cleanEmail);
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb_atlas',
      orders,
    });
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener pedidos', orders: initialMockOrders },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const orderPayload: Order = await req.json();

    if (!orderPayload.id || !orderPayload.customer) {
      return NextResponse.json(
        { success: false, error: 'Datos de pedido incompletos' },
        { status: 400 }
      );
    }

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        // 1. Upsert order into orders collection
        const ordersCol = db.collection('orders');
        await ordersCol.updateOne(
          { id: orderPayload.id },
          {
            $set: {
              ...orderPayload,
              createdAt: orderPayload.date || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );

        // 2. Atomic stock deduction for in_stock items
        if (orderPayload.items && orderPayload.items.length > 0) {
          const productsCol = db.collection('products');
          for (const item of orderPayload.items) {
            if (item.stockType === 'in_stock') {
              const pId = isNaN(Number(item.productId)) ? item.productId : Number(item.productId);
              const qty = Number(item.quantity) || 1;

              await productsCol.updateOne(
                { $or: [{ id: pId }, { id: String(pId) }] },
                {
                  $inc: { stockQuantity: -qty },
                  $set: { updatedAt: new Date().toISOString() },
                }
              );

              // Ensure stock never falls below 0
              await productsCol.updateMany(
                { stockQuantity: { $lt: 0 } },
                { $set: { stockQuantity: 0, badge: 'Agotado' } }
              );
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: orderPayload,
      message: 'Pedido registrado exitosamente e inventario descontado.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar el pedido' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'ID de pedido requerido' },
        { status: 400 }
      );
    }

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const ordersCol = db.collection<Order>('orders');
        const existingOrder = await ordersCol.findOne({ id: orderId });

        const updateFields: any = {
          updatedAt: new Date().toISOString(),
        };
        if (status) updateFields.status = status;
        if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;

        await ordersCol.updateOne({ id: orderId }, { $set: updateFields });

        // If order was cancelled, restore stock for in_stock items
        if (status === 'cancelled' && existingOrder && existingOrder.status !== 'cancelled') {
          if (existingOrder.items && existingOrder.items.length > 0) {
            const productsCol = db.collection('products');
            for (const item of existingOrder.items) {
              if (item.stockType === 'in_stock') {
                const pId = isNaN(Number(item.productId)) ? item.productId : Number(item.productId);
                const qty = Number(item.quantity) || 1;

                await productsCol.updateOne(
                  { $or: [{ id: pId }, { id: String(pId) }] },
                  {
                    $inc: { stockQuantity: qty },
                    $set: { badge: 'En Existencia', updatedAt: new Date().toISOString() },
                  }
                );
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pedido #${orderId} actualizado correctamente.`,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}
