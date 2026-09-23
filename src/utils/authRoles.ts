import { AppUser } from '@/types/product';

const ADMIN_EMAILS = [
  'info.aimprimir3d@gmail.com',
  'admin@aimprimir3d.com',
  'esteban@aimprimir3d.com',
  'aimprimir3d@gmail.com',
];

export function isUserAdmin(user: Partial<AppUser> | null | undefined): boolean {
  if (!user) return false;
  
  if (user.role === 'admin') return true;

  if (user.email) {
    const cleanEmail = user.email.toLowerCase().trim();
    if (ADMIN_EMAILS.includes(cleanEmail)) return true;
    if (cleanEmail.endsWith('@aimprimir3d.com') || cleanEmail.endsWith('@aimprimir3d.com.do')) return true;
  }

  if (typeof window !== 'undefined') {
    const adminSession = sessionStorage.getItem('aimprimir3d_admin_auth');
    if (adminSession === 'true') return true;
  }

  return false;
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('aimprimir3d_user');
    if (!userStr) return null;
    const u: AppUser = JSON.parse(userStr);
    
    // Auto-promocionar a admin si su email coincide
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
