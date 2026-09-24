import { NextResponse } from 'next/server';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';
import { StaffMember } from '@/types/product';

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Esteban Astacio',
    email: 'portaforza@gmail.com',
    role: 'admin',
    department: 'Dirección General & Producción',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-2',
    name: 'aImprimir3D Admin',
    email: 'info.aimprimir3d@gmail.com',
    role: 'admin',
    department: 'Soporte y Finanzas',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-3',
    name: 'Taller & Logística',
    email: 'admin@aimprimir3d.com',
    role: 'admin',
    department: 'Almacén e Impresoras 3D',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-4',
    name: 'Operador de Granja 3D',
    email: 'staff@aimprimir3d.com',
    role: 'supervisor',
    department: 'Control de Calidad y Envíos',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Almacén en memoria de respaldo
let localStaffStore: StaffMember[] = [...DEFAULT_STAFF];

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        const staffList = await db.collection('staff_users').find().toArray();
        if (staffList && staffList.length > 0) {
          const cleaned = staffList.map((doc: any) => ({
            id: doc.id || doc._id?.toString() || String(Date.now()),
            name: doc.name || 'Personal aImprimir3D',
            email: doc.email,
            role: doc.role || 'operador',
            department: doc.department || 'Taller',
            active: doc.active !== false,
            createdAt: doc.createdAt || new Date().toISOString(),
            lastLogin: doc.lastLogin,
          }));
          return NextResponse.json({ success: true, staff: cleaned });
        } else {
          // Sembrar con el personal inicial
          await db.collection('staff_users').insertMany(DEFAULT_STAFF);
          return NextResponse.json({ success: true, staff: DEFAULT_STAFF });
        }
      }
    }
    return NextResponse.json({ success: true, staff: localStaffStore });
  } catch (error: any) {
    console.error('Error fetching staff users:', error);
    return NextResponse.json({ success: true, staff: localStaffStore });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, department } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanEmail || !cleanName) {
      return NextResponse.json({ error: 'Nombre y correo electrónico son requeridos.' }, { status: 400 });
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanName,
      email: cleanEmail,
      role: role || 'operador',
      department: department || 'Taller 3D',
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        await db.collection('staff_users').updateOne(
          { email: cleanEmail },
          { $set: newStaff },
          { upsert: true }
        );
      }
    }

    // Actualizar memoria
    localStaffStore = localStaffStore.filter((s) => s.email !== cleanEmail);
    localStaffStore.unshift(newStaff);

    return NextResponse.json({ success: true, staffMember: newStaff, message: 'Empleado autorizado agregado exitosamente.' });
  } catch (error: any) {
    console.error('Error adding staff member:', error);
    return NextResponse.json({ error: error.message || 'Error al agregar empleado.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, role, department, active } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail && !id) {
      return NextResponse.json({ error: 'Identificador o correo requerido.' }, { status: 400 });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (role !== undefined) updateFields.role = role;
    if (department !== undefined) updateFields.department = department;
    if (active !== undefined) updateFields.active = Boolean(active);
    updateFields.updatedAt = new Date().toISOString();

    if (isMongoDBConfigured()) {
      const db = await getDatabase();
      if (db) {
        if (id) {
          await db.collection('staff_users').updateOne(
            { $or: [{ id }, { email: cleanEmail }] },
            { $set: updateFields }
          );
        } else {
          await db.collection('staff_users').updateOne({ email: cleanEmail }, { $set: updateFields });
        }
      }
    }

    // Actualizar local
    localStaffStore = localStaffStore.map((s) => {
      if ((id && s.id === id) || (cleanEmail && s.email === cleanEmail)) {
        return { ...s, ...updateFields };
      }
      return s;
    });

    return NextResponse.json({ success: true, message: 'Permisos de empleado actualizados.' });
  } catch (error: any) {
    console.error('Error updating staff member:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar empleado.' }, { status: 500 });
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
        await db.collection('staff_users').deleteOne({
          $or: [{ id: id || '' }, { email: email || '' }],
        });
      }
    }

    localStaffStore = localStaffStore.filter((s) => s.id !== id && s.email !== email);

    return NextResponse.json({ success: true, message: 'Acceso de empleado revocado exitosamente.' });
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar empleado.' }, { status: 500 });
  }
}
