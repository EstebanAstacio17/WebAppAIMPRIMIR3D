'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function LoginPage() {
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
          Inicia sesión con tu cuenta de Google. Tu nivel de acceso (Cliente o Administrador) se identificará automáticamente.
        </p>

        {/* GOOGLE SIGN-IN BUTTON */}
        <div style={{ margin: '28px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GoogleAuthButton text="continue_with" redirectTo="/dashboard" />
        </div>

        {/* SECURITY & IDENTITY HIGHLIGHTS */}
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
            <span><strong>Autenticación Oficial de Google:</strong> Máxima seguridad sin contraseñas ni códigos vulnerables.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            <span><strong>Detección Automática de Rol:</strong> Los administradores y empleados autorizados acceden al panel de control; los clientes a sus pedidos.</span>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <Link href="/" style={{ color: '#0071e3', fontSize: '0.86rem', fontWeight: 600 }}>
            ← Volver a la Tienda y Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
