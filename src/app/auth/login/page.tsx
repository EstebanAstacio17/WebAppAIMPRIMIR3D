'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userObj = {
      name: email.split('@')[0],
      email: email.toLowerCase().trim(),
      loggedInAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('aimprimir3d_user', JSON.stringify(userObj));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        <Link href="/">
          <Image src="/img/logonombre.png" alt="Logo" width={180} height={44} className={styles.logo} priority />
        </Link>
        <h1 className={styles.authTitle}>Iniciar Sesión</h1>
        <p className={styles.authSubtitle}>Accede a tu cuenta para rastrear tus pedidos</p>

        <form onSubmit={handleLogin}>
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
    </div>
  );
}
