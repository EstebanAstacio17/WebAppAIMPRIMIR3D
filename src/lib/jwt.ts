import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'aimprimir3d-secure-production-jwt-key-2026-secret-phrase-portaforza';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AppUserTokenPayload {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'operador' | 'client';
  google_id?: string;
  picture?: string;
  [key: string]: any;
}

/**
 * Genera un JWT criptográficamente firmado por el servidor de aImprimir3D
 */
export async function signAppJWT(payload: AppUserTokenPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 días de validez

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setIssuer('aimprimir3d-auth-server')
    .setAudience('aimprimir3d-platform')
    .sign(JWT_SECRET);
}

/**
 * Verifica la firma criptográfica del JWT emitido por nuestro servidor
 */
export async function verifyAppJWT(token: string): Promise<AppUserTokenPayload | null> {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'aimprimir3d-auth-server',
      audience: 'aimprimir3d-platform',
    });
    return payload as unknown as AppUserTokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extrae y valida el usuario autenticado desde los headers Authorization o cookies
 */
export async function getAuthUserFromRequest(
  req: Request | NextRequest
): Promise<AppUserTokenPayload | null> {
  // 1. Intentar desde Header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const verified = await verifyAppJWT(bearerToken);
    if (verified) return verified;
  }

  // 2. Intentar desde Cookies (auth_token o aimprimir3d_jwt)
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );

    const tokenFromCookie = cookies['auth_token'] || cookies['aimprimir3d_jwt'];
    if (tokenFromCookie) {
      const verified = await verifyAppJWT(tokenFromCookie);
      if (verified) return verified;
    }

    // Fallback de compatibilidad con sesión JSON en caso de transición
    if (cookies['aimprimir3d_staff_session'] || cookies['auth_session']) {
      try {
        const rawJson = cookies['aimprimir3d_staff_session'] || cookies['auth_session'];
        const parsed = JSON.parse(rawJson);
        if (parsed && parsed.email) {
          return {
            id: parsed.id || parsed.sub || parsed.email,
            email: parsed.email.toLowerCase().trim(),
            name: parsed.name || '',
            role: parsed.role || (cookies['aimprimir3d_staff_session'] ? 'admin' : 'client'),
            picture: parsed.picture,
          };
        }
      } catch (e) {
        // Ignorar si no es JSON válido
      }
    }
  }

  return null;
}

/**
 * Interceptor de seguridad: Exige que el usuario sea Admin / Staff
 */
export async function requireStaffOrAdmin(
  req: Request | NextRequest
): Promise<{ user: AppUserTokenPayload | null; errorResponse: Response | null }> {
  const user = await getAuthUserFromRequest(req);

  if (!user) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: 'Acceso no autenticado. Se requiere inicio de sesión con Google.',
          code: 'UNAUTHENTICATED',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const staffRoles = ['admin', 'supervisor', 'operador'];
  if (!staffRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: 'Acceso denegado (403 Forbidden). Esta acción requiere permisos de Administrador.',
          code: 'FORBIDDEN_STAFF_ONLY',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Interceptor de seguridad: Exige que sea el dueño del pedido o un Administrador
 */
export async function requireOrderOwnerOrStaff(
  req: Request | NextRequest,
  orderCustomerEmail?: string
): Promise<{ user: AppUserTokenPayload | null; errorResponse: Response | null }> {
  const user = await getAuthUserFromRequest(req);

  if (!user) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: 'Acceso no autenticado.',
          code: 'UNAUTHENTICATED',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const isStaff = ['admin', 'supervisor', 'operador'].includes(user.role);
  if (isStaff) {
    return { user, errorResponse: null };
  }

  // Si es cliente, verificar si es el dueño
  if (orderCustomerEmail && user.email.toLowerCase().trim() === orderCustomerEmail.toLowerCase().trim()) {
    return { user, errorResponse: null };
  }

  return {
    user: null,
    errorResponse: new Response(
      JSON.stringify({
        success: false,
        error: 'Acceso denegado. No tienes permisos para ver o modificar pedidos de otros clientes.',
        code: 'FORBIDDEN_NOT_ORDER_OWNER',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    ),
  };
}
