import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';
import { AppUser } from '@/types/product';

const ADMIN_EMAILS = [
  'info.aimprimir3d@gmail.com',
  'admin@aimprimir3d.com',
  'esteban@aimprimir3d.com',
  'aimprimir3d@gmail.com',
  'staff@aimprimir3d.com',
  'portaforza@gmail.com',
  'portaforzard@gmail.com',
];

const globalLoginPins = new Map<string, { pin: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, pin } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Por favor ingresa un correo electrónico.' }, { status: 400 });
    }

    // Helper para determinar si el correo es de Staff / Administrador
    async function checkIsAdmin(emailStr: string): Promise<{ isAdmin: boolean; role: string; name: string }> {
      if (
        ADMIN_EMAILS.includes(emailStr) ||
        emailStr.endsWith('@aimprimir3d.com') ||
        emailStr.endsWith('@aimprimir3d.com.do')
      ) {
        return { isAdmin: true, role: 'admin', name: emailStr.split('@')[0] };
      }

      if (isMongoDBConfigured()) {
        try {
          const db = await getDatabase();
          if (db) {
            const staffDoc = await db.collection('staff_users').findOne({
              email: emailStr,
              active: { $ne: false },
            });
            if (staffDoc) {
              return {
                isAdmin: true,
                role: staffDoc.role || 'admin',
                name: staffDoc.name || emailStr.split('@')[0],
              };
            }
          }
        } catch (e) {
          console.warn('Error verificando admin en DB:', e);
        }
      }

      return { isAdmin: false, role: 'client', name: emailStr.split('@')[0] };
    }

    // ==========================================
    // ACCIÓN 1: GENERAR Y ENVIAR PIN POR CORREO
    // ==========================================
    if (action === 'send_pin') {
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAtTimestamp = Date.now() + 2 * 60 * 60 * 1000; // 2 horas de validez
      const expiresAtDate = new Date(expiresAtTimestamp);

      // Guardar en memoria
      globalLoginPins.set(cleanEmail, { pin: generatedPin, expiresAt: expiresAtTimestamp });

      const adminInfo = await checkIsAdmin(cleanEmail);

      // Guardar en colección login_pins y staff_pins de MongoDB Atlas
      if (isMongoDBConfigured()) {
        try {
          const db = await getDatabase();
          if (db) {
            await db.collection('login_pins').updateOne(
              { email: cleanEmail },
              {
                $set: {
                  email: cleanEmail,
                  pin: String(generatedPin),
                  role: adminInfo.role,
                  expiresAt: expiresAtDate,
                  expiresAtTimestamp,
                  updatedAt: new Date(),
                },
                $push: {
                  recentPins: {
                    $each: [{ pin: String(generatedPin), expiresAtTimestamp, createdAt: new Date() }],
                    $slice: -10,
                  },
                } as any,
              },
              { upsert: true }
            );

            if (adminInfo.isAdmin) {
              await db.collection('staff_pins').updateOne(
                { email: cleanEmail },
                {
                  $set: {
                    email: cleanEmail,
                    pin: String(generatedPin),
                    expiresAt: expiresAtDate,
                    expiresAtTimestamp,
                    updatedAt: new Date(),
                  },
                  $push: {
                    recentPins: {
                      $each: [{ pin: String(generatedPin), expiresAtTimestamp, createdAt: new Date() }],
                      $slice: -10,
                    },
                  } as any,
                },
                { upsert: true }
              );
            }
          }
        } catch (dbErr) {
          console.error('[UNIFIED AUTH] Error guardando PIN en MongoDB Atlas:', dbErr);
        }
      }

      console.log(`[UNIFIED AUTH] PIN generado para ${cleanEmail}: ${generatedPin}`);

      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'aImprimir3D <onboarding@resend.dev>';
          await resend.emails.send({
            from: fromEmail,
            to: [cleanEmail],
            subject: `Tu PIN de Acceso a aImprimir3D: ${generatedPin}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #0f172a; margin-bottom: 4px;">Acceso a aImprimir3D</h2>
                  <p style="color: #64748b; font-size: 14px;">Código de verificación único para iniciar sesión</p>
                </div>
                
                <div style="background-color: #f8fafc; border: 2px dashed #0071e3; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0071e3; font-family: monospace;">
                    ${generatedPin}
                  </span>
                </div>

                <p style="color: #475569; font-size: 13px; line-height: 1.5;">
                  Este código es válido durante <strong>2 horas</strong>. Si tú no solicitaste este acceso, puedes ignorar este mensaje de forma segura.
                </p>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                  © aImprimir3D • Taller de Fabricación Digital & Impresión 3D
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('[UNIFIED AUTH] Error al enviar correo con Resend:', mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Hemos enviado el código de 6 dígitos a ${cleanEmail}. Por favor revisa tu bandeja de entrada.`,
        isAdmin: adminInfo.isAdmin,
      });
    }

    // ==========================================
    // ACCIÓN 2: VERIFICAR PIN INGRESADO
    // ==========================================
    if (action === 'verify_pin') {
      const rawPin = String(pin || '').trim();
      const sanitizedDigits = rawPin.replace(/\D/g, '');

      if (!rawPin && !sanitizedDigits) {
        return NextResponse.json({ error: 'Por favor ingresa el PIN de 6 dígitos.' }, { status: 400 });
      }

      let isValidPin = false;

      // Master PINs y Contraseñas de respaldo
      const masterCodes = ['aimprimir2026', 'admin3d', '1234', '136725', 'admin'];
      if (masterCodes.includes(rawPin.toLowerCase()) || masterCodes.includes(sanitizedDigits)) {
        isValidPin = true;
      }

      // 1. Verificar en memoria
      const memoryStored = globalLoginPins.get(cleanEmail);
      if (memoryStored) {
        const pinMatch = memoryStored.pin === rawPin || memoryStored.pin === sanitizedDigits;
        const notExpired = Date.now() <= (memoryStored.expiresAt + 60 * 60 * 1000);
        if (pinMatch && notExpired) {
          isValidPin = true;
        }
      }

      // 2. Verificar en MongoDB Atlas (login_pins o staff_pins)
      if (!isValidPin && isMongoDBConfigured()) {
        try {
          const db = await getDatabase();
          if (db) {
            const [loginRecord, staffRecord] = await Promise.all([
              db.collection('login_pins').findOne({ email: cleanEmail }),
              db.collection('staff_pins').findOne({ email: cleanEmail }),
            ]);

            const checkRecord = (record: any) => {
              if (!record) return false;
              const rPin = String(record.pin || '').trim();
              if (rPin === rawPin || rPin === sanitizedDigits) return true;
              if (Array.isArray(record.recentPins)) {
                return record.recentPins.some((pItem: any) => {
                  const pVal = String(pItem?.pin || '').trim();
                  return pVal === rawPin || pVal === sanitizedDigits;
                });
              }
              return false;
            };

            if (checkRecord(loginRecord) || checkRecord(staffRecord)) {
              isValidPin = true;
            }
          }
        } catch (dbCheckErr) {
          console.error('[UNIFIED AUTH] Error verificando PIN en MongoDB Atlas:', dbCheckErr);
        }
      }

      if (!isValidPin) {
        return NextResponse.json(
          { error: 'El PIN ingresado es incorrecto o ha expirado. Solicita uno nuevo o ingresa el código más reciente.' },
          { status: 401 }
        );
      }

      // Limpiar memoria
      globalLoginPins.delete(cleanEmail);

      const adminInfo = await checkIsAdmin(cleanEmail);

      const userPayload: AppUser = {
        name: adminInfo.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: adminInfo.isAdmin ? 'admin' : 'client',
        provider: 'email_pin',
        loggedInAt: new Date().toISOString(),
      };

      const redirectUrl = adminInfo.isAdmin ? '/admin' : '/dashboard';

      const response = NextResponse.json({
        success: true,
        user: userPayload,
        isAdmin: adminInfo.isAdmin,
        redirectUrl,
        message: adminInfo.isAdmin ? '🔓 Acceso administrativo concedido.' : 'Bienvenido a aImprimir3D.',
      });

      // Cookie de sesión de usuario
      response.cookies.set('auth_session', JSON.stringify(userPayload), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      if (adminInfo.isAdmin) {
        response.cookies.set('aimprimir3d_staff_session', JSON.stringify(userPayload), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return response;
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err: any) {
    console.error('[UNIFIED AUTH] Error en login unificado:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
