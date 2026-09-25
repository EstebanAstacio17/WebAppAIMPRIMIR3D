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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {loading && (
        <div style={{ fontSize: '0.88rem', color: '#0071e3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px', border: '2px solid #0071e3', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
          Validando cuenta de Google y permisos oficiales...
        </div>
      )}

      {errorMsg && (
        <div style={{ fontSize: '0.84rem', color: '#ef4444', textAlign: 'center', background: '#fef2f2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fecaca', maxWidth: '380px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {clientId ? (
        <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      ) : null}
    </div>
  );
}
