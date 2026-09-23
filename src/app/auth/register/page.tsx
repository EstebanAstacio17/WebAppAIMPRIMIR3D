'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = cleanEmail.includes('@aimprimir3d');

    const userObj = {
      name: name.trim(),
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'client',
      provider: 'credentials',
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
        <h1 className={styles.authTitle}>Crear Cuenta</h1>
        <p className={styles.authSubtitle}>Únete para cotizar y dar seguimiento en vivo a tus pedidos</p>

        {/* GOOGLE IDENTITY SERVICES BOTÓN NATIVO */}
        <div className={styles.googleSection}>
          <GoogleAuthButton text="signup_with" redirectTo="/dashboard" />
        </div>

        <div className={styles.divider}>
          <span>o con tu correo</span>
        </div>

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nombre Completo</label>
            <input
              type="text"
              id="name"
              className={styles.input}
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            {loading ? 'Creando cuenta...' : 'Registrarme y Rastrear Pedidos'}
          </button>
        </form>

        <div className={styles.authLinks}>
          ¿Ya tienes una cuenta? 
          <Link href="/auth/login" className={styles.authLink}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
