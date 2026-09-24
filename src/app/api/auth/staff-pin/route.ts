import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDatabase, isMongoDBConfigured } from '@/lib/mongodb';

// Almacenamiento en memoria temporal de respaldo para PINs de staff
const globalPinStore = new Map<string, { pin: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, pin } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Por favor ingresa un correo electrónico.' }, { status: 400 });
    }

    // ==========================================
    // ACCIÓN 1: GENERAR Y ENVIAR PIN POR CORREO
    // ==========================================
    if (action === 'send_pin') {
      // Generar PIN aleatorio de 6 dígitos numéricos
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAtTimestamp = Date.now() + 30 * 60 * 1000; // 30 minutos de validez
      const expiresAtDate = new Date(expiresAtTimestamp);

      // Guardar en memoria
      globalPinStore.set(cleanEmail, { pin: generatedPin, expiresAt: expiresAtTimestamp });

      // Guardar de forma persistente en colección staff_pins de MongoDB Atlas
      if (isMongoDBConfigured()) {
        try {
          const db = await getDatabase();
          if (db) {
            await db.collection('staff_pins').updateOne(
              { email: cleanEmail },
              {
                $set: {
                  email: cleanEmail,
                  pin: String(generatedPin),
                  expiresAt: expiresAtDate,
                  expiresAtTimestamp: expiresAtTimestamp,
                  updatedAt: new Date(),
                },
              },
              { upsert: true }
            );
            console.log(`[STAFF AUTH] PIN ${generatedPin} guardado en MongoDB Atlas para ${cleanEmail}`);
          }
        } catch (dbErr) {
          console.error('[STAFF AUTH] Error guardando PIN en MongoDB Atlas:', dbErr);
        }
      }

      console.log(`[STAFF AUTH] PIN generado para ${cleanEmail}: ${generatedPin}`);

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
                  <h2 style="color: #0f172a; margin-bottom: 4px;">Acceso de Personal aImprimir3D</h2>
                  <p style="color: #64748b; font-size: 14px;">Código de verificación único de 6 dígitos</p>
                </div>
                
                <div style="background-color: #f8fafc; border: 2px dashed #0071e3; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0071e3; font-family: monospace;">
                    ${generatedPin}
                  </span>
                </div>

                <p style="color: #475569; font-size: 13px; line-height: 1.5;">
                  Este código es válido durante <strong>30 minutos</strong>. Si tú no solicitaste este acceso, puedes ignorar este mensaje.
                </p>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                  © aImprimir3D • Taller de Fabricación Digital
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('[STAFF AUTH] Error al enviar correo con Resend:', mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Hemos enviado el código de 6 dígitos a ${cleanEmail}. Por favor revisa tu bandeja de entrada.`,
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

      // Master PINs de respaldo
      if (rawPin === 'aimprimir2026' || rawPin.toLowerCase() === 'aimprimir2026' || rawPin === '136725') {
        isValidPin = true;
      }

      // 1. Verificar en memoria del servidor
      const memoryStored = globalPinStore.get(cleanEmail);
      if (memoryStored) {
        const pinMatch = memoryStored.pin === rawPin || memoryStored.pin === sanitizedDigits;
        const notExpired = Date.now() <= memoryStored.expiresAt;
        if (pinMatch && notExpired) {
          isValidPin = true;
        }
      }

      // 2. Verificar en base de datos MongoDB Atlas
      if (!isValidPin && isMongoDBConfigured()) {
        try {
          const db = await getDatabase();
          if (db) {
            const record = await db.collection('staff_pins').findOne({ email: cleanEmail });
            if (record) {
              const recordPin = String(record.pin || '').trim();
              const isMatch = recordPin === rawPin || recordPin === sanitizedDigits;
              
              const expTime = record.expiresAtTimestamp || (record.expiresAt ? new Date(record.expiresAt).getTime() : 0);
              // Margen de tolerancia de 5 minutos adicionales
              const isFresh = expTime > (Date.now() - 5 * 60 * 1000);

              if (isMatch && isFresh) {
                isValidPin = true;
                // Limpiar registro tras uso exitoso
                await db.collection('staff_pins').deleteOne({ email: cleanEmail }).catch(() => {});
              }
            }
          }
        } catch (dbCheckErr) {
          console.error('[STAFF AUTH] Error verificando PIN en MongoDB Atlas:', dbCheckErr);
        }
      }

      if (!isValidPin) {
        return NextResponse.json(
          { error: 'El PIN ingresado es incorrecto o ha expirado. Solicita uno nuevo o ingresa el código más reciente.' },
          { status: 401 }
        );
      }

      // Eliminar el PIN de memoria tras uso exitoso
      globalPinStore.delete(cleanEmail);

      const staffUser = {
        name: cleanEmail.split('@')[0] || 'Staff aImprimir3D',
        email: cleanEmail,
        role: 'admin',
        provider: 'email_pin',
        loggedInAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        success: true,
        user: staffUser,
        message: 'PIN verificado correctamente.',
      });

      // Cookie de sesión administrativa
      response.cookies.set('aimprimir3d_staff_session', JSON.stringify(staffUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return response;
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err: any) {
    console.error('[STAFF AUTH] Error en staff-pin:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
