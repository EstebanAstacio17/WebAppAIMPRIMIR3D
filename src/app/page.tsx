import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO SECTION (APPLE PRO SPACE GRAY & NAVY BLUE) */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>

        <div className="container">
          <div className={styles.heroGrid}>
            {/* HERO LEFT */}
            <div className={`${styles.heroLeft} animate-fade-in`}>
              <div className={styles.badgePill}>
                <span className="status-dot"></span>
                <span>Taller de Fabricación Digital 3D</span>
              </div>

              <h1 className={styles.heroTitle}>
                Ideas que se imprimen. <br />
                <span className="text-metallic">Soluciones que se crean.</span>
              </h1>

              <p className={styles.heroSubtext}>
                Tecnología de manufactura aditiva de ultra precisión. Prototipos industriales, figuras coleccionables en resina 8K y piezas a medida con estándares profesionales.
              </p>

              <div className={styles.heroBtnGroup}>
                <Link href="/catalogo" className="btn btn-primary">
                  <span>Explorar Catálogo</span>
                </Link>
                <Link href="#cotizador" className="btn btn-titanium">
                  <span>⚡ Cotizador Instantáneo</span>
                </Link>
                <a 
                  href="https://wa.me/18494622228" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-titanium"
                >
                  <span>WhatsApp Directo</span>
                </a>
              </div>

              {/* TRUST & PROOF STATS */}
              <div className={styles.heroTrustStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>+2,500</span>
                  <span className={styles.statLabel}>Piezas Fabricadas</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>8K Ultra</span>
                  <span className={styles.statLabel}>Resolución Resina</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>24-48h</span>
                  <span className={styles.statLabel}>Tiempos de Entrega</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>Garantía de Precisión</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT (3D SHOWCASE CARD) */}
            <div className={`${styles.heroRight} animate-fade-in`}>
              <div className={styles.showcaseCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.printerStatus}>
                    <span className="status-dot"></span>
                    <span>12 Impresoras Activas</span>
                  </div>
                  <span className={styles.modelBadge}>FDM & Resina 8K</span>
                </div>

                <div className={styles.showcaseMedia}>
                  <Image
                    src="/img/hero_printer.jpg"
                    alt="Impresora 3D de Alta Precisión en Acción"
                    fill
                    className={styles.showcaseImg}
                    priority
                  />
                  <div className={styles.floatingTag}>
                    <span>Fabricación en curso: PETG Técnico</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Tolerancia</span>
                    <span className={styles.specVal}>±0.05 mm</span>
                  </div>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Materiales</span>
                    <span className={styles.specVal}>PLA / PETG / Resina</span>
                  </div>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Cobertura</span>
                    <span className={styles.specVal}>Todo el País 🇩🇴</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE QUOTE CALCULATOR */}
      <LiveQuoteCalculator />

      {/* SERVICIOS ESPECIALIZADOS (APPLE BENTO GRID) */}
      <section id="servicios" className={styles.section} style={{ background: '#f5f5f7' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Capacidades Técnicas</span>
            <h2 className={styles.sectionTitle}>Servicios de Fabricación 3D</h2>
            <p className={styles.sectionSubtitle}>
              Soluciones diseñadas con la máxima precisión para ingenieros, creadores y empresas.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>🧪</div>
              <h3 className={styles.serviceTitle}>Figuras & Coleccionables 8K</h3>
              <p className={styles.serviceDesc}>
                Impresión en resina fotosensible de ultra resolución sin líneas de capa perceptibles. Acabado sedoso ideal para modelismo, anime y coleccionables.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Resina 8K</span>
                <span className={styles.serviceTagPill}>Ultra Detalle</span>
                <span className={styles.serviceTagPill}>Acabado Sedoso</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>⚙️</div>
              <h3 className={styles.serviceTitle}>Prototipado & Piezas Mecánicas</h3>
              <p className={styles.serviceDesc}>
                Fabricación de repuestos, carcasas y ensambles funcionales en filamentos técnicos de alta resistencia mecánica y térmica (PETG, ABS, Nylon).
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>FDM Industrial</span>
                <span className={styles.serviceTagPill}>Alta Resistencia</span>
                <span className={styles.serviceTagPill}>PETG / ABS</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>📐</div>
              <h3 className={styles.serviceTitle}>Diseño & Modelado CAD</h3>
              <p className={styles.serviceDesc}>
                Convertimos planos, bocetos o piezas físicas desgastadas en modelos 3D paramétricos listos para producción y validación milimétrica.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Modelado Paramétrico</span>
                <span className={styles.serviceTagPill}>Ingeniería Inversa</span>
                <span className={styles.serviceTagPill}>Optimización STL</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>🏭</div>
              <h3 className={styles.serviceTitle}>Producción en Serie</h3>
              <p className={styles.serviceDesc}>
                Capacidad para fabricar desde decenas hasta cientos de unidades para proyectos comerciales, eventos corporativos o souvenirs con tarifas por volumen.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Tarifas por Volumen</span>
                <span className={styles.serviceTagPill}>Control de Calidad</span>
                <span className={styles.serviceTagPill}>Entregas Rápidas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DESTACADO */}
      <section className={styles.section} style={{ background: '#ffffff', borderTop: '1px solid #e5e5ea' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Modelos Populares</span>
            <h2 className={styles.sectionTitle}>Diseños Listos para Encargar</h2>
            <p className={styles.sectionSubtitle}>
              Selecciona modelos destacados o solicita una pieza a medida desde nuestro cotizador.
            </p>
          </div>

          <div className={styles.productsGrid}>
            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/resin_figures.jpg"
                  alt="Dragón Mítico Resina 8K"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Resina 8K</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Coleccionables</span>
                <h4 className={styles.productTitle}>Dragón Mítico & Mecha Escultórico</h4>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$1,850</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide1.png"
                  alt="Soporte Gamer"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Popular</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Accesorios</span>
                <h4 className={styles.productTitle}>Soporte Ergonómico Headset & Control</h4>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$950</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide2.png"
                  alt="Lámpara Litofanía"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Personalizable</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Hogar</span>
                <h4 className={styles.productTitle}>Lámpara Litofanía 3D Personalizada</h4>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$1,450</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide3.png"
                  alt="Repuesto Engranaje"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Ingeniería</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Industrial</span>
                <h4 className={styles.productTitle}>Repuesto de Engranaje Técnico PETG</h4>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$650</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '45px' }}>
            <Link href="/catalogo" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '0.95rem' }}>
              Ver Catálogo Completo
            </Link>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (APPLE TIMELINE) */}
      <section id="como-funciona" className={styles.section} style={{ background: '#f5f5f7' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Experiencia Simple</span>
            <h2 className={styles.sectionTitle}>¿Cómo Funciona tu Encargo?</h2>
            <p className={styles.sectionSubtitle}>
              Un proceso transparente y trazable desde el modelado hasta la entrega.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Selecciona o Envía tu Archivo</h3>
              <p className={styles.stepDesc}>
                Elige productos prediseñados o sube tu archivo 3D (STL, OBJ, STEP) con las medidas necesarias.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Cotización & Asesoría</h3>
              <p className={styles.stepDesc}>
                Validamos la viabilidad técnica de tu diseño y te asesoramos sobre el mejor material.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Fabricación de Precisión</h3>
              <p className={styles.stepDesc}>
                Imprimimos con tecnología calibrada y aplicamos post-procesado y control de calidad.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Seguimiento y Entrega</h3>
              <p className={styles.stepDesc}>
                Monitorea el estado en tiempo real desde tu cuenta hasta recibir tu paquete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (TITANIUM & NAVY BANNER) */}
      <section className={styles.section} style={{ background: '#ffffff' }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaTitle}>¿Listo para iniciar tu próximo proyecto?</h2>
            <p className={styles.ctaSubtitle}>
              Crea tu cuenta gratis para solicitar cotizaciones, realizar encargos y dar seguimiento al estado de fabricación de tus piezas.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }}>
                Crear Cuenta Gratis
              </Link>
              <Link href="/catalogo" className="btn btn-outline-titanium" style={{ padding: '14px 32px', fontSize: '0.98rem' }}>
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
