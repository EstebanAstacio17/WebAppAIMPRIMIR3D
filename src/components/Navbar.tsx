import Image from "next/image";
import Link from "next/link";
import styles from "@/app/page.module.css"; // Reuse existing styles for now

export default function Navbar() {
  return (
    <>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContainer}`}>
          <div>
            <a href="tel:+18494622228" className={styles.topBarLink}>
              📞 849-462-2228
            </a>
          </div>
          <div>
            <a href="mailto:info.aimprimir3d@gmail.com" className={styles.topBarLink}>
              ✉️ info.aimprimir3d@gmail.com
            </a>
          </div>
        </div>
      </div>

      <nav className={styles.navbar}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/">
            <Image
              src="/img/logonombre.png"
              alt="AIMPRIMIR3D Logo"
              width={200}
              height={50}
              className={styles.logo}
              priority
            />
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/#servicios" className={styles.navLink}>Servicios</Link>
            <Link href="/catalogo" className={styles.navLink}>Catálogo</Link>
            <Link href="/auth/login" className={styles.navLink}>Mi Cuenta</Link>
            <Link href="/catalogo" className="btn btn-primary">
              Iniciar Encargo
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
