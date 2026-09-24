import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, isMongoDBConfigured, getLastMongoError } from '@/lib/mongodb';
import { Order } from '@/types/product';
import { initialMockOrders } from '@/utils/orderStorage';
import { getAuthUserFromRequest } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedEmail = searchParams.get('email');

    // 🛡️ Obtener identidad criptográficamente validada desde el servidor
    const authUser = await getAuthUserFromRequest(req);
    const isStaff = authUser && ['admin', 'supervisor', 'operador'].includes(authUser.role);

    // Si es un cliente regular autenticado, AISLAMIENTO ESTRICTO: solo puede ver sus propios pedidos
    let effectiveEmailFilter: string | null = null;
    if (authUser && !isStaff) {
      effectiveEmailFilter = authUser.email.toLowerCase().trim();
    } else if (isStaff) {
      effectiveEmailFilter = requestedEmail ? requestedEmail.toLowerCase().trim() : null;
    } else if (requestedEmail) {
      effectiveEmailFilter = requestedEmail.toLowerCase().trim();
    }

    if (!isMongoDBConfigured()) {
      let result = initialMockOrders;
      if (effectiveEmailFilter) {
        result = result.filter(o => o.email && o.email.toLowerCase().trim() === effectiveEmailFilter);
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
      if (effectiveEmailFilter) {
        result = result.filter(o => o.email && o.email.toLowerCase().trim() === effectiveEmailFilter);
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

    let query: any = {};
    if (effectiveEmailFilter) {
      query = {
        $or: [
          { email: effectiveEmailFilter },
          { 'customer.email': effectiveEmailFilter },
        ],
      };
    }

    const orders = await collection.find(query).sort({ _id: -1 }).toArray();

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

    // Vincular con usuario autenticado si existe sesión
    const authUser = await getAuthUserFromRequest(req);
    const userId = authUser ? authUser.id : null;
    const userEmail = authUser ? authUser.email : orderPayload.email;

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        // 1. Upsert order into orders collection con aislamiento
        const ordersCol = db.collection('orders');
        await ordersCol.updateOne(
          { id: orderPayload.id },
          {
            $set: {
              ...orderPayload,
              userId: userId || orderPayload.userId,
              email: (userEmail || orderPayload.email || '').toLowerCase().trim(),
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

        // 3. Si el cliente está registrado, acumular en su ficha de cliente
        if (userEmail) {
          try {
            await db.collection('customers').updateOne(
              { email: userEmail.toLowerCase().trim() },
              {
                $inc: {
                  totalOrders: 1,
                  totalSpent: Number(orderPayload.total) || 0,
                },
                $set: {
                  lastOrderDate: new Date().toISOString(),
                },
              }
            );
          } catch (cErr) {
            console.warn('Error actualizando métricas de cliente:', cErr);
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

    // 🛡️ Muro de Autorización
    const authUser = await getAuthUserFromRequest(req);
    const isStaff = authUser && ['admin', 'supervisor', 'operador'].includes(authUser.role);

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const ordersCol = db.collection<Order>('orders');
        const existingOrder = await ordersCol.findOne({ id: orderId });

        if (!existingOrder) {
          return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
        }

        // Si no es staff, verificar que sea el dueño del pedido
        if (!isStaff) {
          const isOwner =
            authUser &&
            existingOrder.email &&
            authUser.email.toLowerCase().trim() === existingOrder.email.toLowerCase().trim();

          if (!isOwner) {
            return NextResponse.json(
              {
                success: false,
                error: 'Acceso denegado (403 Forbidden): No tienes autorización para modificar este pedido.',
              },
              { status: 403 }
            );
          }
        }

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
