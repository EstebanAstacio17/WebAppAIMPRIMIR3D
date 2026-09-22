import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

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

      <Footer />
    </>
  );
}
