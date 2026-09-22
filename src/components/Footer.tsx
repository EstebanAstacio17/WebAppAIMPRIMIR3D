import Image from "next/image";
import Link from "next/link";
import styles from "@/app/page.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div>
            <Image
              src="/img/logonombre.png"
              alt="AIMPRIMIR3D"
              width={200}
              height={50}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p style={{ marginTop: '20px', color: '#ccc' }}>
              Ideas que se crean. Soluciones que se imprimen.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Enlaces Rápidos</h4>
            <Link href="/" className={styles.footerLink}>Inicio</Link>
            <Link href="/catalogo" className={styles.footerLink}>Catálogo</Link>
            <Link href="/auth/login" className={styles.footerLink}>Mi Cuenta</Link>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Contacto</h4>
            <p className={styles.footerLink}>📞 849-462-2228</p>
            <p className={styles.footerLink}>✉️ info.aimprimir3d@gmail.com</p>
            <a href="https://instagram.com/aimprimir3d" target="_blank" rel="noreferrer" className={styles.footerLink}>
              📱 @aimprimir3d
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} AIMPRIMIR3D. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
