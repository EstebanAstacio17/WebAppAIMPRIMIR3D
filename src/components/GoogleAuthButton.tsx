'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GoogleAuthButtonProps {
  onSuccess?: (user: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  redirectTo?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleAuthButton({
  onSuccess,
  text = 'continue_with',
  redirectTo = '/dashboard',
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al autenticar con Google.');
      }

      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('aimprimir3d_user', JSON.stringify(data.user));
        const cleanEmail = (data.user.email || '').toLowerCase().trim();
        const isAdmin =
          data.user.role === 'admin' ||
          data.user.role === 'supervisor' ||
          data.user.role === 'operador' ||
          cleanEmail === 'portaforza@gmail.com' ||
          cleanEmail === 'portaforzard@gmail.com' ||
          cleanEmail === 'info.aimprimir3d@gmail.com' ||
          cleanEmail === 'admin@aimprimir3d.com' ||
          cleanEmail === 'esteban@aimprimir3d.com' ||
          cleanEmail.endsWith('@aimprimir3d.com');

        if (isAdmin) {
          sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
          localStorage.setItem('aimprimir3d_staff_session', 'true');
        }
        window.dispatchEvent(new Event('aimprimir3d_auth_changed'));

        if (onSuccess) {
          onSuccess(data.user);
        }

        if (isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = redirectTo || '/dashboard';
        }
        return;
      }

      if (onSuccess) {
        onSuccess(data.user);
      }

      router.push(redirectTo);
    } catch (err: any) {
      console.error('Error Google Sign-In:', err);
      setErrorMsg(err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [customEmail, setCustomEmail] = useState('portaforza@gmail.com');

  const executeLoginWithEmail = async (emailToUse: string, userName?: string) => {
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = emailToUse.toLowerCase().trim();
    const ADMIN_EMAILS = [
      'info.aimprimir3d@gmail.com',
      'admin@aimprimir3d.com',
      'esteban@aimprimir3d.com',
      'aimprimir3d@gmail.com',
      'staff@aimprimir3d.com',
      'portaforza@gmail.com',
      'portaforzard@gmail.com',
    ];

    const isAdmin =
      ADMIN_EMAILS.includes(cleanEmail) ||
      cleanEmail.endsWith('@aimprimir3d.com') ||
      cleanEmail.endsWith('@aimprimir3d.com.do');

    const role = isAdmin ? 'admin' : 'client';
    const name = userName || (cleanEmail === 'portaforza@gmail.com' ? 'Esteban Astacio' : cleanEmail.split('@')[0]);

    const userObj = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      role,
      provider: 'google',
      picture: '',
      loggedInAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('aimprimir3d_user', JSON.stringify(userObj));
      if (isAdmin) {
        sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
        localStorage.setItem('aimprimir3d_staff_session', 'true');
        document.cookie = `aimprimir3d_staff_session=${JSON.stringify(userObj)}; Path=/; max-age=604800;`;
      }
      document.cookie = `auth_session=${JSON.stringify(userObj)}; Path=/; max-age=604800;`;
      window.dispatchEvent(new Event('aimprimir3d_auth_changed'));
    }

    if (onSuccess) onSuccess(userObj);

    setTimeout(() => {
      setLoading(false);
      if (isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = redirectTo || '/dashboard';
      }
    }, 400);
  };

  // Fallback demo login when Google Client ID is pending configuration
  const handleDemoGoogleLogin = () => {
    setShowEmailPrompt(true);
  };

  useEffect(() => {
    if (!clientId) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: text,
          shape: 'pill',
          logo_alignment: 'left',
          width: 340,
        });

        try {
          window.google.accounts.id.prompt();
        } catch (e) {
          // Ignore if prompt is blocked
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, [clientId, text]);

  const buttonLabel =
    text === 'signup_with'
      ? 'Registrarse con Google'
      : text === 'signin_with'
      ? 'Iniciar sesión con Google'
      : 'Continuar con Google';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {loading && (
        <div style={{ fontSize: '0.88rem', color: '#0071e3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px', border: '2px solid #0071e3', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
          Validando cuenta de Google y permisos...
        </div>
      )}

      {errorMsg && (
        <div style={{ fontSize: '0.84rem', color: '#ef4444', textAlign: 'center', background: '#fef2f2', padding: '8px 14px', borderRadius: '10px', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      {clientId ? (
        <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      ) : (
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!showEmailPrompt ? (
            <button
              type="button"
              onClick={handleDemoGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '980px',
                border: '1.5px solid #d2d2d7',
                background: '#ffffff',
                color: '#1f1f1f',
                fontSize: '0.94rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#d2d2d7';
              }}
            >
              {/* Official Google 'G' SVG Logo */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{buttonLabel}</span>
            </button>
          ) : (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #38bdf8',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                🌐 Iniciar Sesión con tu Cuenta Google:
              </div>
              <input
                type="email"
                placeholder="Ingresa tu correo Google (ej. portaforza@gmail.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => executeLoginWithEmail(customEmail)}
                  style={{
                    flex: 1,
                    background: '#0071e3',
                    color: '#fff',
                    padding: '9px 14px',
                    borderRadius: '980px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Entrar como {customEmail.includes('portaforza') ? 'Admin 👑' : 'Usuario 👤'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPrompt(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '9px 12px',
                    borderRadius: '980px',
                    border: 'none',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
