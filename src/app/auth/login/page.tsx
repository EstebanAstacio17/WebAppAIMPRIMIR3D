import Link from "next/link";
import Image from "next/image";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass animate-fade-in`}>
        <Link href="/">
          <Image src="/img/logonombre.png" alt="Logo" width={200} height={60} className={styles.logo} />
        </Link>
        <h1 className={styles.authTitle}>Iniciar Sesión</h1>
        <p className={styles.authSubtitle}>Bienvenido de nuevo a AIMPRIMIR3D</p>

        <form>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
            <input type="email" id="email" className={styles.input} placeholder="tu@correo.com" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input type="password" id="password" className={styles.input} placeholder="••••••••" required />
          </div>
          
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Ingresar
          </button>
        </form>

        <div className={styles.authLinks}>
          ¿No tienes una cuenta? 
          <Link href="/auth/register" className={styles.authLink}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
