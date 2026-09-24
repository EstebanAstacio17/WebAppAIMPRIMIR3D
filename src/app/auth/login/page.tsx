'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { AppUser } from '@/types/product';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // PASO 1: ENVIAR PIN DE 6 DÍGITOS AL CORREO DEL USUARIO
  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_pin', email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar el código de acceso.');
      }

      setPinSent(true);
      setFeedback(`✓ Código de verificación de 6 dígitos enviado a ${cleanEmail}. Revisa tu bandeja de entrada.`);
    } catch (err: any) {
      setError(err.message || 'Error al generar código.');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: VERIFICAR PIN Y REDIRIGIR AUTOMÁTICAMENTE SEGÚN ROL
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.replace(/\s+/g, '').trim();

    if (!cleanPin) {
      setError('Por favor ingresa el código de 6 dígitos recibido.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', email: cleanEmail, pin: cleanPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código incorrecto o expirado.');
      }

      const userObj: AppUser = data.user || {
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: data.isAdmin ? 'admin' : 'client',
        provider: 'email_pin',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('aimprimir3d_user', JSON.stringify(userObj));

      if (data.isAdmin) {
        sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
        localStorage.setItem('aimprimir3d_staff_session', 'true');
      }

      window.dispatchEvent(new Event('aimprimir3d_auth_changed'));

      // Redirección inteligente y automática
      if (data.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar código de acceso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        {/* LOGO */}
        <Link href="/" style={{ display: 'inline-block', marginBottom: '8px' }}>
          <Image src="/img/logonombre.png" alt="aImprimir3D Logo" width={180} height={44} className={styles.logo} priority />
        </Link>

        <h1 className={styles.authTitle}>Acceso a la Plataforma</h1>
        <p className={styles.authSubtitle}>
          Inicia sesión para gestionar tus pedidos o acceder a tu panel
        </p>

        {/* 1. GOOGLE ONE-TAP & SIGN-IN (AUTO ROLE DETECTION) */}
        <div className={styles.googleSection} style={{ marginBottom: '18px' }}>
          <GoogleAuthButton text="continue_with" redirectTo="/dashboard" />
        </div>

        <div className={styles.divider}>
          <span>o continúa con tu correo</span>
        </div>

        {/* 2. UNIFIED EMAIL & VERIFICATION PIN */}
        {!pinSent ? (
          // PASO 1: INGRESAR CORREO
          <form onSubmit={handleRequestPin} className="animate-fade-in" style={{ textAlign: 'left' }}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="tu@correo.com o admin@aimprimir3d.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.84rem', margin: '8px 0', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
              style={{ width: '100%', padding: '13px', marginTop: '10px' }}
            >
              {loading ? 'Generando código...' : '📨 Enviar Código de Acceso a mi Correo'}
            </button>
          </form>
        ) : (
          // PASO 2: INGRESAR PIN DE 6 DÍGITOS
          <form onSubmit={handleVerifyPin} className="animate-fade-in" style={{ textAlign: 'left' }}>
            {feedback && (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 14px', borderRadius: '12px', border: '1px solid #a7f3d0', fontSize: '0.83rem', marginBottom: '16px' }}>
                {feedback}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="pin" className={styles.label}>
                Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>:
              </label>
              <input
                type="text"
                id="pin"
                className={styles.input}
                placeholder="• • • • • •"
                value={pin}
                maxLength={20}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  letterSpacing: '6px',
                  fontWeight: 700,
                }}
                required
                autoFocus
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.84rem', margin: '8px 0', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', background: '#0071e3', borderColor: '#0071e3', marginTop: '10px' }}
            >
              {loading ? 'Verificando...' : '🔓 Verificar e Ingresar'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setPinSent(false);
                  setPin('');
                  setError(null);
                }}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Cambiar correo o reenviar código
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#64748b' }}>
          aImprimir3D • Detección automática de cuenta de cliente y administrador
        </div>
      </div>
    </div>
  );
}
