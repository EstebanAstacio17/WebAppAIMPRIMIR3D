'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { AppUser } from '@/types/product';
import { isUserAdmin } from '@/utils/authRoles';

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<'client' | 'staff'>('client');

  // Client form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Staff 2-step form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [staffFeedback, setStaffFeedback] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // 1. Manejar login de CLIENTE
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = isUserAdmin({ email: cleanEmail });

    const userObj: AppUser = {
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'client',
      provider: 'credentials',
      loggedInAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('aimprimir3d_user', JSON.stringify(userObj));
      if (isAdmin) {
        sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
      }
      window.dispatchEvent(new Event('aimprimir3d_auth_changed'));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setLoading(false);
      router.push(isAdmin ? '/admin' : '/dashboard');
    }, 500);
  };

  // 2. Paso 1 Staff: ENVIAR PIN DE 6 DÍGITOS AL CORREO
  const handleRequestStaffPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffFeedback(null);

    const cleanEmail = staffEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setStaffError('Por favor ingresa tu correo de personal.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/staff-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_pin', email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar el PIN.');
      }

      setPinSent(true);
      setStaffFeedback(
        data.devPin
          ? `✓ PIN enviado. (Código para prueba local: ${data.devPin})`
          : `✓ Hemos enviado el código de 6 dígitos a ${cleanEmail}.`
      );
    } catch (err: any) {
      setStaffError(err.message || 'Error al generar el PIN.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Paso 2 Staff: VERIFICAR PIN DE 6 DÍGITOS E INGRESAR
  const handleVerifyStaffPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    const cleanEmail = staffEmail.trim().toLowerCase();
    const cleanPin = staffPin.trim();

    if (!cleanPin || cleanPin.length < 4) {
      setStaffError('Por favor ingresa los 6 dígitos del PIN recibido.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/staff-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', email: cleanEmail, pin: cleanPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'PIN incorrecto.');
      }

      const staffUser: AppUser = {
        name: cleanEmail.split('@')[0] || 'Staff aImprimir3D',
        email: cleanEmail,
        role: 'admin',
        provider: 'email_pin',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('aimprimir3d_user', JSON.stringify(staffUser));
      sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
      window.dispatchEvent(new Event('aimprimir3d_auth_changed'));

      router.push('/admin');
    } catch (err: any) {
      setStaffError(err.message || 'Error al validar PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        <Link href="/">
          <Image src="/img/logonombre.png" alt="Logo" width={180} height={44} className={styles.logo} priority />
        </Link>
        <h1 className={styles.authTitle}>Acceso a la Plataforma</h1>
        <p className={styles.authSubtitle}>Selecciona tu tipo de cuenta para ingresar</p>

        {/* SELECTOR DE TIPO DE ACCESO (CLIENTE VS PERSONAL) */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '22px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRoleTab('client');
              setStaffError(null);
            }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: roleTab === 'client' ? '#ffffff' : 'transparent',
              color: roleTab === 'client' ? '#0f172a' : '#64748b',
              fontWeight: 600,
              fontSize: '0.86rem',
              boxShadow: roleTab === 'client' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            👤 Acceso Clientes
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleTab('staff');
              setStaffError(null);
            }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: roleTab === 'staff' ? '#0f172a' : 'transparent',
              color: roleTab === 'staff' ? '#ffffff' : '#64748b',
              fontWeight: 600,
              fontSize: '0.86rem',
              boxShadow: roleTab === 'staff' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🛠️ Personal aImprimir3D
          </button>
        </div>

        {/* ========================================================= */}
        {/* VISTA 1: CLIENTES */}
        {/* ========================================================= */}
        {roleTab === 'client' ? (
          <div>
            <div className={styles.googleSection}>
              <GoogleAuthButton text="continue_with" redirectTo="/dashboard" />
            </div>

            <div className={styles.divider}>
              <span>o con tu correo</span>
            </div>

            <form onSubmit={handleClientLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Contraseña</label>
                <input
                  type="password"
                  id="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                {loading ? 'Iniciando sesión...' : 'Ingresar y Ver Mis Pedidos'}
              </button>
            </form>

            <div className={styles.authLinks}>
              ¿No tienes una cuenta aún? 
              <Link href="/auth/register" className={styles.authLink}>
                Regístrate aquí
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VISTA 2: PERSONAL aImprimir3D (LOGIN CON PIN POR CORREO) */
          /* ========================================================= */
          <div className="animate-fade-in" style={{ textAlign: 'left' }}>
            {!pinSent ? (
              // PASO 1: INGRESAR CORREO Y SOLICITAR PIN
              <form onSubmit={handleRequestStaffPin}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Acceso de Personal por PIN:</strong> Escribe tu correo de staff y te enviaremos un código PIN aleatorio de 6 dígitos para ingresar.
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="staffEmail" className={styles.label}>Correo del Personal aImprimir3D *</label>
                  <input
                    type="email"
                    id="staffEmail"
                    className={styles.input}
                    placeholder="info.aimprimir3d@gmail.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {staffError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', margin: '8px 0' }}>
                    {staffError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '13px', background: '#0f172a', borderColor: '#0f172a', marginTop: '12px' }}
                >
                  {loading ? 'Generando PIN...' : '📨 Enviar PIN de 6 Dígitos a mi Correo'}
                </button>
              </form>
            ) : (
              // PASO 2: INGRESAR EL PIN DE 6 DÍGITOS RECIBIDO
              <form onSubmit={handleVerifyStaffPin} className="animate-fade-in">
                {staffFeedback && (
                  <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 14px', borderRadius: '12px', border: '1px solid #a7f3d0', fontSize: '0.83rem', marginBottom: '16px' }}>
                    {staffFeedback}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="staffPin" className={styles.label}>
                    Ingresa el PIN de 6 dígitos enviado a <strong>{staffEmail}</strong>:
                  </label>
                  <input
                    type="text"
                    id="staffPin"
                    className={styles.input}
                    placeholder="• • • • • •"
                    value={staffPin}
                    maxLength={6}
                    onChange={(e) => setStaffPin(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      letterSpacing: '8px',
                      fontWeight: 700,
                    }}
                    required
                    autoFocus
                  />
                </div>

                {staffError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', margin: '8px 0' }}>
                    {staffError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '13px', background: '#0071e3', borderColor: '#0071e3', marginTop: '10px' }}
                >
                  {loading ? 'Verificando PIN...' : '🔓 Verificar PIN e Ingresar al Panel'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPinSent(false);
                      setStaffPin('');
                      setStaffError(null);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← Cambiar correo o Reenviar PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
