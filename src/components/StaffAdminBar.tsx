'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, isUserAdmin } from '@/utils/authRoles';

export default function StaffAdminBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkRole = () => {
      const user = getCurrentUser();
      const adminStatus = isUserAdmin(user);
      setIsAdmin(adminStatus);
      if (user) setUserName(user.name || 'Staff');
    };

    checkRole();
    window.addEventListener('storage', checkRole);
    window.addEventListener('aimprimir3d_auth_changed', checkRole);

    return () => {
      window.removeEventListener('storage', checkRole);
      window.removeEventListener('aimprimir3d_auth_changed', checkRole);
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '10px 20px',
        borderBottom: '2px solid #0071e3',
        fontSize: '0.86rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            background: '#0071e3',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '980px',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          🛠️ Modo Staff aImprimir3D
        </span>
        <span style={{ color: '#94a3b8' }}>
          Conectado como: <strong style={{ color: '#ffffff' }}>{userName}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Link
          href="/admin"
          style={{
            background: '#38bdf8',
            color: '#0f172a',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.82rem',
            textDecoration: 'none',
          }}
        >
          🏷️ Gestionar Catálogo & Stock
        </Link>
        <Link
          href="/admin"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.82rem',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          📦 Ver Pedidos & Envíos
        </Link>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('aimprimir3d_admin_auth');
            const u = getCurrentUser();
            if (u) {
              u.role = 'client';
              localStorage.setItem('aimprimir3d_user', JSON.stringify(u));
            }
            window.location.reload();
          }}
          style={{
            background: 'none',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Salir de Staff
        </button>
      </div>
    </div>
  );
}
