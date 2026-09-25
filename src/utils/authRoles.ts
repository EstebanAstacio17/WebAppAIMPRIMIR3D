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

export function isUserAdmin(user?: Partial<AppUser> | null): boolean {
  if (!user || !user.email) return false;
  
  const cleanEmail = user.email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(cleanEmail)) return true;
  if (cleanEmail.endsWith('@aimprimir3d.com') || cleanEmail.endsWith('@aimprimir3d.com.do')) return true;

  if (user.role === 'admin' || user.role === 'supervisor' || user.role === 'operador') {
    return ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.endsWith('@aimprimir3d.com') || cleanEmail.endsWith('@aimprimir3d.com.do');
  }

  return false;
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('aimprimir3d_user');
    if (!userStr) return null;
    const u: AppUser = JSON.parse(userStr);
    if (!u || !u.email) return null;
    return u;
  } catch (e) {
    console.error('Error recuperando usuario actual:', e);
    return null;
  }
}

/**
 * Cierra la sesión globalmente, limpiando todos los identificadores de cliente y staff
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('aimprimir3d_user');
    localStorage.removeItem('aimprimir3d_staff_session');
    sessionStorage.removeItem('aimprimir3d_admin_auth');
    document.cookie = 'aimprimir3d_staff_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.dispatchEvent(new Event('aimprimir3d_auth_changed'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error cerrando sesión:', e);
  }
}
