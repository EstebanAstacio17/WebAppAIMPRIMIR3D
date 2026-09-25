'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_pin', email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar el código de verificación.');
      }

      setPinSent(true);
      setSuccessMsg(data.message || `Código enviado a ${email.trim()}. Revisa tu bandeja de entrada.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error enviando código de verificación.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', email: email.trim(), pin: pin.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código de verificación incorrecto.');
      }

      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('aimprimir3d_user', JSON.stringify(data.user));
        if (data.isAdmin) {
          sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
          localStorage.setItem('aimprimir3d_staff_session', 'true');
        }
        window.dispatchEvent(new Event('aimprimir3d_auth_changed'));
        window.location.href = data.redirectUrl || (data.isAdmin ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error verificando código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        {/* LOGO */}
        <Link href="/" style={{ display: 'inline-block', marginBottom: '12px' }}>
          <Image
            src="/img/logonombre.png"
            alt="aImprimir3D Logo"
            width={200}
            height={48}
            className={styles.logo}
            priority
          />
        </Link>

        <h1 className={styles.authTitle}>Acceso a la Plataforma</h1>
        <p className={styles.authSubtitle}>
          Inicia sesión de forma segura con tu cuenta de Google o con un código enviado a tu correo.
        </p>

        {/* GOOGLE SIGN-IN BUTTON */}
        <div style={{ margin: '20px 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <GoogleAuthButton text="continue_with" redirectTo="/dashboard" />
        </div>

        <div className={styles.divider} style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></span>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>o verificación por correo</span>
          <span style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></span>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', marginBottom: '16px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', marginBottom: '16px', textAlign: 'center' }}>
            ✉️ {successMsg}
          </div>
        )}

        {!pinSent ? (
          <form onSubmit={handleSendPin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <div>
              <label htmlFor="emailInput" style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Correo Electrónico
              </label>
              <input
                id="emailInput"
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem', fontWeight: 600 }}
            >
              {loading ? 'Enviando código...' : '📨 Enviar Código de Acceso'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <div>
              <label htmlFor="pinInput" style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Código de 6 dígitos recibido:
              </label>
              <input
                id="pinInput"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '2px solid #0071e3',
                  fontSize: '1.2rem',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem', fontWeight: 600 }}
            >
              {loading ? 'Verificando...' : '🔓 Verificar Código y Entrar'}
            </button>
            <button
              type="button"
              onClick={() => { setPinSent(false); setPin(''); }}
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              ← Cambiar correo o reenviar
            </button>
          </form>
        )}

        {/* SECURITY HIGHLIGHTS */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '16px 18px',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
            marginTop: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#334155' }}>
            <span style={{ fontSize: '1rem' }}>🛡️</span>
            <span><strong>Cuentas Verificadas:</strong> Se requiere confirmación de titularidad de la cuenta.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#334155' }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <span><strong>Rol Automático:</strong> Administradores al panel `/admin` y Clientes a `/dashboard`.</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
          <Link href="/" style={{ color: '#0071e3', fontSize: '0.86rem', fontWeight: 600 }}>
            ← Volver a la Tienda y Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
