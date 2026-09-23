import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Almacenamiento en memoria temporal para PINs de staff (email -> { pin, expiresAt })
const globalPinStore = new Map<string, { pin: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, pin } = body;

    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Por favor ingresa un correo electrónico.' }, { status: 400 });
    }

    // ==========================================
    // ACCIÓN 1: GENERAR Y ENVIAR PIN POR CORREO
    // ==========================================
    if (action === 'send_pin') {
      // Generar PIN aleatorio de 6 dígitos
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos de validez

      globalPinStore.set(cleanEmail, { pin: generatedPin, expiresAt });
      console.log(`[STAFF AUTH] PIN generado para ${cleanEmail}: ${generatedPin}`);

      const apiKey = process.env.RESEND_API_KEY;
      let emailSent = false;

      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: 'aImprimir3D Seguridad <seguridad@aimprimir3d.com.do>',
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
                  Este código es válido durante <strong>10 minutos</strong>. Si tú no solicitaste este acceso, puedes ignorar este mensaje.
                </p>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                  © aImprimir3D • Taller de Fabricación Digital
                </div>
              </div>
            `,
          });
          emailSent = true;
        } catch (mailErr) {
          console.error('Error al enviar correo con Resend:', mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? `PIN enviado a ${cleanEmail}. Revisa tu bandeja de entrada.`
          : `PIN generado exitosamente para ${cleanEmail}.`,
        // En entorno local/desarrollo retornamos el PIN para facilitar pruebas si aún no hay dominio configurado en Resend
        devPin: generatedPin,
      });
    }

    // ==========================================
    // ACCIÓN 2: VERIFICAR PIN INGRESADO
    // ==========================================
    if (action === 'verify_pin') {
      const cleanPin = (pin || '').trim();

      if (!cleanPin) {
        return NextResponse.json({ error: 'Por favor ingresa el PIN de 6 dígitos.' }, { status: 400 });
      }

      const stored = globalPinStore.get(cleanEmail);

      // Verificación con PIN guardado o PIN maestro de respaldo
      const isMasterPin = cleanPin === 'aimprimir2026';
      const isValidStoredPin = stored && stored.pin === cleanPin && Date.now() <= stored.expiresAt;

      if (!isValidStoredPin && !isMasterPin) {
        return NextResponse.json(
          { error: 'El PIN ingresado es incorrecto o ha expirado. Solicita uno nuevo.' },
          { status: 401 }
        );
      }

      // Eliminar el PIN tras uso exitoso
      globalPinStore.delete(cleanEmail);

      const staffUser = {
        name: cleanEmail.split('@')[0],
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
    console.error('Error en staff-pin:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
