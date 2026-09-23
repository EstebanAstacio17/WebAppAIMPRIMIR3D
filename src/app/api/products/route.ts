import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';
import { Product } from '@/types/product';
import { initialMockProducts } from '@/utils/productStorage';

export async function GET() {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        products: initialMockProducts,
      });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        products: initialMockProducts,
      });
    }

    const collection = db.collection<Product>('products');
    let products = await collection.find({}).sort({ updatedAt: -1, id: 1 }).toArray();

    // Auto-seed if database collection is empty
    if (products.length === 0) {
      await collection.insertMany(initialMockProducts as any);
      products = await collection.find({}).toArray();
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb_atlas',
      products,
    });
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener productos', products: initialMockProducts },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productPayload: Product = {
      id: body.id || Date.now(),
      title: body.title || 'Nueva Pieza 3D',
      description: body.description || '',
      categoria: body.categoria || 'Accesorios',
      price: Number(body.price) || 0,
      image: body.image || '/img/slide1.png',
      badge: body.badge || (body.stockType === 'in_stock' ? 'En Existencia' : 'Bajo Encargo'),
      tiempo: body.tiempo || '1-2 días',
      stockType: body.stockType || 'in_stock',
      stockQuantity: body.stockType === 'in_stock' ? Number(body.stockQuantity) || 0 : 0,
      volumePricing: body.volumePricing || [],
      onDemandPolicies: body.onDemandPolicies,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection('products');
        await collection.insertOne(productPayload as any);
      }
    }

    return NextResponse.json({
      success: true,
      product: productPayload,
      message: 'Producto guardado exitosamente.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = body.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection('products');
        const updateDoc: any = {
          ...body,
          updatedAt: new Date().toISOString(),
        };
        delete updateDoc._id; // Remove MongoDB internal _id from update payload

        await collection.updateOne(
          { id: productId },
          { $set: updateDoc },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado en MongoDB Atlas.',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const numericId = isNaN(Number(id)) ? id : Number(id);
        await db.collection('products').deleteOne({
          $or: [{ id: numericId }, { id: id }],
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
