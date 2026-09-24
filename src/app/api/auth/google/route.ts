import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';
import { signAppJWT } from '@/lib/jwt';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(googleClientId);

const ADMIN_EMAILS = [
  'info.aimprimir3d@gmail.com',
  'admin@aimprimir3d.com',
  'esteban@aimprimir3d.com',
  'aimprimir3d@gmail.com',
  'staff@aimprimir3d.com',
  'portaforza@gmail.com',
  'portaforzard@gmail.com',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado.' }, { status: 400 });
    }

    if (!googleClientId) {
      return NextResponse.json(
        {
          error: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID no configurado en variables de entorno (.env.local)',
        },
        { status: 500 }
      );
    }

    // 1. Verificación criptográfica obligatoria con la librería oficial de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Token inválido o sin información de correo.' }, { status: 401 });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const googleSubId = payload.sub;

    // 2. Determinar si el correo pertenece al Personal / Administradores de aImprimir3D
    let isStaff =
      ADMIN_EMAILS.includes(cleanEmail) ||
      cleanEmail.endsWith('@aimprimir3d.com') ||
      cleanEmail.endsWith('@aimprimir3d.com.do');

    let staffRole: 'admin' | 'supervisor' | 'operador' | 'client' = isStaff ? 'admin' : 'client';
    let staffName = payload.name || cleanEmail.split('@')[0];

    if (isMongoDBConfigured()) {
      try {
        const db = await getDatabase();
        if (db) {
          const staffDoc = await db.collection('staff_users').findOne({
            email: cleanEmail,
            active: { $ne: false },
          });

          if (staffDoc) {
            isStaff = true;
            staffRole = (staffDoc.role as any) || 'admin';
            if (staffDoc.name) staffName = staffDoc.name;

            // Actualizar último inicio de sesión del empleado y google_id
            await db.collection('staff_users').updateOne(
              { email: cleanEmail },
              {
                $set: {
                  google_id: googleSubId,
                  lastLogin: new Date().toISOString(),
                  picture: payload.picture || '',
                },
              }
            );
          }
        }
      } catch (dbErr) {
        console.warn('Error verificando staff en DB:', dbErr);
      }
    }

    // 3. Construir objeto de usuario autenticado
    const userData = {
      id: googleSubId,
      google_id: googleSubId,
      name: staffName,
      email: cleanEmail,
      picture: payload.picture || '',
      emailVerified: payload.email_verified || false,
      provider: 'google',
      role: staffRole,
      loggedInAt: new Date().toISOString(),
    };

    // 4. Si es cliente, registrar o actualizar su ficha en el CRM de clientes
    if (!isStaff && isMongoDBConfigured()) {
      try {
        const db = await getDatabase();
        if (db) {
          await db.collection('customers').updateOne(
            { email: cleanEmail },
            {
              $set: {
                google_id: googleSubId,
                name: userData.name,
                email: cleanEmail,
                picture: userData.picture,
                provider: 'google',
                lastActive: new Date().toISOString(),
              },
              $setOnInsert: {
                id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'active',
                createdAt: new Date().toISOString(),
                totalOrders: 0,
                totalSpent: 0,
              },
            },
            { upsert: true }
          );
        }
      } catch (custErr) {
        console.warn('Error registrando cliente en DB:', custErr);
      }
    }

    // 5. Emisión de Sesión Propia: Servidor genera JWT criptográfico firmado
    const serverJwt = await signAppJWT({
      id: googleSubId,
      google_id: googleSubId,
      email: cleanEmail,
      name: userData.name,
      role: staffRole,
      picture: userData.picture,
    });

    const redirectUrl = isStaff ? '/admin' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      jwt: serverJwt,
      user: userData,
      isAdmin: isStaff,
      role: staffRole,
      redirectUrl,
      message: isStaff
        ? `🔓 Acceso concedido al panel de administración (${userData.name}).`
        : `Bienvenido a aImprimir3D, ${userData.name}.`,
    });

    // 6. Guardar cookies de sesión seguras (HttpOnly JWT + JSON readable para UI)
    response.cookies.set('auth_token', serverJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('auth_session', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (isStaff) {
      response.cookies.set('aimprimir3d_staff_session', JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error al verificar token de Google:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error durante la verificación con Google.',
      },
      { status: 401 }
    );
  }
}
