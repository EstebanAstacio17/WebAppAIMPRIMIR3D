import { AppUser } from '@/types/product';

const ADMIN_EMAILS = [
  'info.aimprimir3d@gmail.com',
  'admin@aimprimir3d.com',
  'esteban@aimprimir3d.com',
  'aimprimir3d@gmail.com',
  'staff@aimprimir3d.com',
];

export function isUserAdmin(user?: Partial<AppUser> | null): boolean {
  // 1. Check browser session / localStorage flags first
  if (typeof window !== 'undefined') {
    const adminLocal = localStorage.getItem('aimprimir3d_staff_session');
    if (adminLocal === 'true') return true;

    const adminSession = sessionStorage.getItem('aimprimir3d_admin_auth');
    if (adminSession === 'true') return true;
  }

  if (!user) return false;
  
  if (user.role === 'admin') return true;

  if (user.email) {
    const cleanEmail = user.email.toLowerCase().trim();
    if (ADMIN_EMAILS.includes(cleanEmail)) return true;
    if (cleanEmail.endsWith('@aimprimir3d.com') || cleanEmail.endsWith('@aimprimir3d.com.do')) return true;
  }

  return false;
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('aimprimir3d_user');
    if (!userStr) {
      // Si está en sesión staff pero sin objeto user, generar uno por defecto
      const adminLocal = localStorage.getItem('aimprimir3d_staff_session');
      const adminSession = sessionStorage.getItem('aimprimir3d_admin_auth');
      if (adminLocal === 'true' || adminSession === 'true') {
        const staffUser: AppUser = {
          name: 'Staff aImprimir3D',
          email: 'admin@aimprimir3d.com',
          role: 'admin',
          provider: 'staff_pin',
          loggedInAt: new Date().toISOString(),
        };
        return staffUser;
      }
      return null;
    }
    const u: AppUser = JSON.parse(userStr);
    
    // Auto-promocionar a admin si su email o sesión coincide
    if (isUserAdmin(u) && u.role !== 'admin') {
      u.role = 'admin';
      localStorage.setItem('aimprimir3d_user', JSON.stringify(u));
    }
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
