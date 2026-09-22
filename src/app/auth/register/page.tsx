import Link from "next/link";
import Image from "next/image";
import styles from "../auth.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass animate-fade-in`}>
        <Link href="/">
          <Image src="/img/logonombre.png" alt="Logo" width={200} height={60} className={styles.logo} />
        </Link>
        <h1 className={styles.authTitle}>Crear Cuenta</h1>
        <p className={styles.authSubtitle}>Únete a nosotros para gestionar tus encargos</p>

        <form>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nombre Completo</label>
            <input type="text" id="name" className={styles.input} placeholder="Juan Pérez" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
            <input type="email" id="email" className={styles.input} placeholder="tu@correo.com" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input type="password" id="password" className={styles.input} placeholder="••••••••" required />
          </div>
          
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Registrarse
          </button>
        </form>

        <div className={styles.authLinks}>
          ¿Ya tienes una cuenta? 
          <Link href="/auth/login" className={styles.authLink}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
