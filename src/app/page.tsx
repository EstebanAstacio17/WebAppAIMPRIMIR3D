import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* TOP BAR */}
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

      {/* NAVBAR */}
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
            <Link href="#servicios" className={styles.navLink}>Servicios</Link>
            <Link href="/catalogo" className={styles.navLink}>Catálogo</Link>
            <Link href="/auth/login" className={styles.navLink}>Mi Cuenta</Link>
            <Link href="/catalogo" className="btn btn-primary">
              Iniciar Encargo
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} glass animate-fade-in`}>
          <h1 className={styles.heroTitle}>
            Ideas que se imprimen. <br />
            <span className="text-gradient">Soluciones que se crean.</span>
          </h1>
          <p className={styles.heroText}>
            Convertimos tus ideas en piezas reales con tecnología de impresión 3D de alta precisión. Regístrate hoy y gestiona tus pedidos fácilmente.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <Link href="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
            <Link href="/auth/register" className="btn btn-outline">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
          <div className={styles.servicesGrid}>
            <div className={`${styles.serviceCard} glass`}>
              <div className={styles.serviceIcon}>🧊</div>
              <h3>Impresión 3D</h3>
              <p>Alta precisión y calidad para cualquier tipo de pieza o figura.</p>
            </div>
            <div className={`${styles.serviceCard} glass`}>
              <div className={styles.serviceIcon}>📐</div>
              <h3>Diseño 3D</h3>
              <p>Modelamos tus ideas desde cero listos para la impresión.</p>
            </div>
            <div className={`${styles.serviceCard} glass`}>
              <div className={styles.serviceIcon}>⚙️</div>
              <h3>Prototipado</h3>
              <p>Prototipos rápidos para validar tus proyectos antes de la producción.</p>
            </div>
            <div className={`${styles.serviceCard} glass`}>
              <div className={styles.serviceIcon}>🏭</div>
              <h3>Producción</h3>
              <p>Fabricación de lotes personalizados para tu negocio o evento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
    </>
  );
}
