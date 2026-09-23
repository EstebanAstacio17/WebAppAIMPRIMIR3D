import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(googleClientId);

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

    // Verificación criptográfica obligatoria con la librería oficial de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Token inválido o sin información de correo.' }, { status: 401 });
    }

    const userData = {
      id: payload.sub,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase().trim(),
      picture: payload.picture || '',
      emailVerified: payload.email_verified || false,
      provider: 'google',
      loggedInAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Autenticación con Google exitosa.',
    });

    // Guardar cookie de sesión segura HTTP-Only
    response.cookies.set('auth_session', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error: any) {
    console.error('Error al verificar token de Google:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error durante la verificación del token con Google.',
      },
      { status: 401 }
    );
  }
}
