import { NextResponse } from 'next/server';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';
import { CustomerUser } from '@/types/product';

const INITIAL_MOCK_CUSTOMERS: CustomerUser[] = [
  {
    id: 'cust-1',
    name: 'Juan Perez',
    email: 'cliente.demo@gmail.com',
    phone: '849-852-4568',
    address: 'Av. Winston Churchill, Piantini, Santo Domingo',
    status: 'active',
    notes: 'Cliente frecuente de litofanías personalizadas.',
    totalOrders: 1,
    totalSpent: 1450,
    createdAt: '2026-09-01T10:00:00.000Z',
    lastActive: '2026-09-23T18:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Cliente Prueba En Vivo',
    email: 'cliente@prueba.do',
    phone: '809-555-9988',
    address: 'Bella Vista, Santo Domingo D.N.',
    status: 'vip',
    notes: 'Cuenta de prueba y compras corporativas.',
    totalOrders: 2,
    totalSpent: 2800,
    createdAt: '2026-09-15T14:30:00.000Z',
    lastActive: '2026-09-24T00:00:00.000Z',
  },
];

let localCustomers: CustomerUser[] = [...INITIAL_MOCK_CUSTOMERS];

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const [dbCustomers, dbOrders] = await Promise.all([
          db.collection('customers').find().toArray(),
          db.collection('orders').find().toArray(),
        ]);

        const customerMap = new Map<string, any>();

        // 1. Cargar clientes existentes en DB
        for (const c of dbCustomers) {
          const email = String(c.email || '').toLowerCase().trim();
          if (email) {
            customerMap.set(email, {
              id: c.id || c._id?.toString() || `cust-${Date.now()}`,
              name: c.name || email.split('@')[0],
              email: email,
              phone: c.phone || '',
              address: c.address || '',
              picture: c.picture || '',
              provider: c.provider || 'email',
              status: c.status || 'active',
              notes: c.notes || '',
              createdAt: c.createdAt || new Date().toISOString(),
              lastActive: c.lastActive || c.createdAt || new Date().toISOString(),
              totalOrders: 0,
              totalSpent: 0,
            });
          }
        }

        // 2. Auto-descubrir clientes desde la colección de pedidos
        if (Array.isArray(dbOrders)) {
          for (const o of dbOrders) {
            const email = String(o.email || '').toLowerCase().trim();
            if (email) {
              let cust = customerMap.get(email);
              if (!cust) {
                cust = {
                  id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: o.customer || email.split('@')[0],
                  email: email,
                  phone: o.phone || '',
                  address: o.address || '',
                  status: 'active',
                  notes: 'Cliente registrado automáticamente vía pedido',
                  createdAt: o.date || new Date().toISOString(),
                  lastActive: o.date || new Date().toISOString(),
                  totalOrders: 0,
                  totalSpent: 0,
                };
                customerMap.set(email, cust);
                // Guardar nuevo cliente auto-descubierto
                await db.collection('customers').updateOne(
                  { email },
                  { $set: cust },
                  { upsert: true }
                ).catch(() => {});
              }
              cust.totalOrders = (cust.totalOrders || 0) + 1;
              cust.totalSpent = (cust.totalSpent || 0) + (Number(o.total) || 0);
              if (o.phone && !cust.phone) cust.phone = o.phone;
              if (o.address && !cust.address) cust.address = o.address;
            }
          }
        }

        const resultList = Array.from(customerMap.values());
        if (resultList.length > 0) {
          return NextResponse.json({ success: true, customers: resultList });
        }
      }
    }

    return NextResponse.json({ success: true, customers: localCustomers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: true, customers: localCustomers });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, notes, status } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanEmail || !cleanName) {
      return NextResponse.json({ error: 'Nombre y correo electrónico son requeridos.' }, { status: 400 });
    }

    const newCustomer: CustomerUser = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      notes: notes?.trim() || '',
      status: status || 'active',
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        await db.collection('customers').updateOne(
          { email: cleanEmail },
          { $set: newCustomer },
          { upsert: true }
        );
      }
    }

    localCustomers = localCustomers.filter((c) => c.email !== cleanEmail);
    localCustomers.unshift(newCustomer);

    return NextResponse.json({ success: true, customer: newCustomer, message: 'Cliente registrado exitosamente.' });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message || 'Error al registrar cliente.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, phone, address, status, notes } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail && !id) {
      return NextResponse.json({ error: 'ID o correo requerido para actualizar.' }, { status: 400 });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;
    updateFields.updatedAt = new Date().toISOString();

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        await db.collection('customers').updateOne(
          { $or: [{ id: id || '' }, { email: cleanEmail }] },
          { $set: updateFields }
        );
      }
    }

    localCustomers = localCustomers.map((c) => {
      if ((id && c.id === id) || (cleanEmail && c.email === cleanEmail)) {
        return { ...c, ...updateFields };
      }
      return c;
    });

    return NextResponse.json({ success: true, message: 'Información del cliente actualizada.' });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar cliente.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!id && !email) {
      return NextResponse.json({ error: 'ID o correo requerido para eliminar.' }, { status: 400 });
    }

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        await db.collection('customers').deleteOne({
          $or: [{ id: id || '' }, { email: email || '' }],
        });
      }
    }

    localCustomers = localCustomers.filter((c) => c.id !== id && c.email !== email);

    return NextResponse.json({ success: true, message: 'Registro del cliente eliminado.' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar cliente.' }, { status: 500 });
  }
}
