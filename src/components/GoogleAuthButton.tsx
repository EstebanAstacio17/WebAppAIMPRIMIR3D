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

      // Guardar usuario en localStorage para el contexto de la aplicación
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('aimprimir3d_user', JSON.stringify(data.user));
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
    if (!clientId) {
      return;
    }

    const initGoogle = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Limpiar contenido previo si re-renderiza
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

        // Opcional: One Tap prompt
        try {
          window.google.accounts.id.prompt();
        } catch (e) {
          // Ignorar si el navegador bloquea One Tap
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

  if (!clientId) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px dashed rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          fontSize: '0.82rem',
          color: '#ef4444',
          textAlign: 'center',
          lineHeight: '1.4',
        }}
      >
        <strong>Google Sign-In pendiente de configuración:</strong>
        <p style={{ marginTop: '4px', color: '#64748b' }}>
          Agrega <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> en tu archivo <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {loading && (
        <div style={{ fontSize: '0.85rem', color: '#0071e3', fontWeight: 500 }}>
          Verificando credenciales con Google...
        </div>
      )}
      {errorMsg && (
        <div style={{ fontSize: '0.82rem', color: '#ef4444', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}
      <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
    </div>
  );
}
