'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function RegisterPage() {
  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '12px' }}>
          <Image src="/img/logonombre.png" alt="Logo" width={180} height={44} className={styles.logo} priority />
        </Link>
        <h1 className={styles.authTitle}>Crear Cuenta</h1>
        <p className={styles.authSubtitle}>
          Regístrate de forma segura con tu cuenta verificada de Google para cotizar y rastrear tus pedidos en vivo.
        </p>

        {/* GOOGLE IDENTITY SERVICES BOTÓN NATIVO */}
        <div style={{ margin: '28px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GoogleAuthButton text="signup_with" redirectTo="/dashboard" />
        </div>

        {/* SECURITY HIGHLIGHTS */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <span><strong>Cuentas Verificadas:</strong> Solo se admiten correos legítimos y verificados por Google.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            <span><strong>Sin Contraseñas:</strong> Acceso instantáneo y seguro sin riesgo de contraseñas olvidadas.</span>
          </div>
        </div>

        <div className={styles.authLinks} style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className={styles.authLink}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
