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

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1}></div>
        <div className={styles.heroGlow2}></div>

        <div className="container">
          <div className={styles.heroGrid}>
            {/* HERO LEFT */}
            <div className={`${styles.heroLeft} animate-fade-in`}>
              <div className={styles.badgePill}>
                <span>✨ Taller de Fabricación Digital & 3D</span>
              </div>

              <h1 className={styles.heroTitle}>
                Tus ideas hechas realidad. <br />
                <span className="text-gradient">Impresión 3D de alta precisión.</span>
              </h1>

              <p className={styles.heroSubtext}>
                Desde figuras de colección en resina 8K con máximo detalle hasta prototipos funcionales y piezas mecánicas bajo demanda. Cotiza al instante y recibe tu pedido con seguimiento en tiempo real.
              </p>

              <div className={styles.heroBtnGroup}>
                <Link href="/catalogo" className="btn btn-cyan">
                  <span>📦 Explorar Catálogo</span>
                </Link>
                <Link href="#cotizador" className="btn btn-outline-white">
                  <span>⚡ Cotizador Instantáneo</span>
                </Link>
                <a 
                  href="https://wa.me/18494622228" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-white"
                >
                  <span>💬 WhatsApp Directo</span>
                </a>
              </div>

              {/* TRUST & PROOF STATS */}
              <div className={styles.heroTrustStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>+2,500</span>
                  <span className={styles.statLabel}>Piezas Entregadas</span>
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
                  <span className={styles.statLabel}>Garantía de Calidad</span>
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
                  <span className={styles.modelBadge}>FDM & SLA 8K</span>
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
                    <span>⚡ Fabricando ahora: Engranaje Helicoidal PETG</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Precisión</span>
                    <span className={styles.specVal}>±0.05 mm</span>
                  </div>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Materiales</span>
                    <span className={styles.specVal}>PLA / PETG / Resina</span>
                  </div>
                  <div className={styles.specPill}>
                    <span className={styles.specTitle}>Envío</span>
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

      {/* SERVICIOS ESPECIALIZADOS */}
      <section id="servicios" className={styles.section} style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>🛠️ Nuestras Soluciones</span>
            <h2 className={styles.sectionTitle}>Servicios de Fabricación 3D</h2>
            <p className={styles.sectionSubtitle}>
              Tecnología de última generación adaptada para hobbistas, empresas, diseñadores e ingenieros.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>🧪</div>
              <h3 className={styles.serviceTitle}>Figuras & Coleccionables 8K</h3>
              <p className={styles.serviceDesc}>
                Impresión en resina fotosensible de ultra resolución sin líneas de capa visibles. Acabado sedoso ideal para modelismo, anime y dioramas.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Resina 8K</span>
                <span className={styles.serviceTagPill}>Ultra Detalle</span>
                <span className={styles.serviceTagPill}>Listo para pintar</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>⚙️</div>
              <h3 className={styles.serviceTitle}>Prototipado & Piezas Mecánicas</h3>
              <p className={styles.serviceDesc}>
                Fabricación de repuestos, carcasas y ensambles funcionales con filamentos técnicos resistentes al impacto, fricción y temperatura (PETG, ABS, TPU).
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>FDM Industrial</span>
                <span className={styles.serviceTagPill}>Alta Resistencia</span>
                <span className={styles.serviceTagPill}>PETG / ABS</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>📐</div>
              <h3 className={styles.serviceTitle}>Diseño & Modelado 3D CAD</h3>
              <p className={styles.serviceDesc}>
                ¿Tienes solo una idea o una pieza rota? Nuestro equipo modela tus conceptos en software 3D profesional listo para fabricación y ajuste milimétrico.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Modelado CAD</span>
                <span className={styles.serviceTagPill}>Ingeniería Inversa</span>
                <span className={styles.serviceTagPill}>Optimización STL</span>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper}>🏭</div>
              <h3 className={styles.serviceTitle}>Producción en Serie & Lotes</h3>
              <p className={styles.serviceDesc}>
                Capacidad de fabricar decenas o cientos de unidades para tu negocio, eventos corporativos, souvenirs o merchandising con descuentos por volumen.
              </p>
              <div className={styles.serviceTags}>
                <span className={styles.serviceTagPill}>Precios por Mayor</span>
                <span className={styles.serviceTagPill}>Entregas Escalonadas</span>
                <span className={styles.serviceTagPill}>Control de Calidad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DESTACADO / TOP TRENDS */}
      <section className={styles.section} style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>🔥 Tendencias & Favoritos</span>
            <h2 className={styles.sectionTitle}>Modelos Listos para Encargar</h2>
            <p className={styles.sectionSubtitle}>
              Selecciona modelos populares prediseñados o explora cientos de opciones en nuestro catálogo completo.
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
                <span className={styles.productBadge}>Resina 8K Ultra</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Coleccionables</span>
                <h4 className={styles.productTitle}>Dragón Mítico & Mecha Escultórico</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Detalle microscópico con base texturizada listo para exhibición.</p>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$1,850</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Opciones
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide1.png"
                  alt="Soporte Articulado Gamer"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Top Ventas</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Accesorios & Setup</span>
                <h4 className={styles.productTitle}>Soporte Articulado para Auriculares & Mando</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Impreso en PLA+ reforzado con organizador de cables integrado.</p>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$950</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Opciones
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide2.png"
                  alt="Litofanía Personalizada con Luz"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Personalizable</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Regalos & Recuerdos</span>
                <h4 className={styles.productTitle}>Lámpara Litofanía con tu Foto Favorita</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Tu fotografía cobra vida en relieve al encender la luz LED cálida.</p>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$1,450</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Opciones
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide3.png"
                  alt="Engranaje y Pieza Mecánica PETG"
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>Ingeniería</span>
              </div>
              <div className={styles.productBody}>
                <span className={styles.productCategory}>Repuestos & Taller</span>
                <h4 className={styles.productTitle}>Repuesto de Engranaje Técnico Alta Densidad</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Fabricado a medida con tolerancia exacta para maquinaria o electrodomésticos.</p>
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>RD$650</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Opciones
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/catalogo" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              🚀 Ver Todo el Catálogo de Productos
            </Link>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (PASO A PASO) */}
      <section id="como-funciona" className={styles.section} style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>💡 Simple y Transparente</span>
            <h2 className={styles.sectionTitle}>¿Cómo Funciona tu Pedido?</h2>
            <p className={styles.sectionSubtitle}>
              Hacer tu encargo es rápido, seguro y con acompañamiento técnico en cada paso.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Elige o Envía tu Diseño</h3>
              <p className={styles.stepDesc}>
                Selecciona productos de nuestro catálogo o envíanos tu archivo 3D (STL, OBJ, STEP) con las medidas deseadas.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Cotización & Asesoría</h3>
              <p className={styles.stepDesc}>
                Revisamos la geometría de tu archivo gratis y te recomendamos el mejor material y resolución para tu presupuesto.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Impresión de Precisión</h3>
              <p className={styles.stepDesc}>
                Fabricamos tu pieza en nuestras impresoras calibradas y realizamos el post-procesado (curado UV, lijado o limpieza).
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Entrega con Trazabilidad</h3>
              <p className={styles.stepDesc}>
                Recibe notificaciones por correo y consulta el estatus de tu paquete en tu panel de cliente hasta llegar a tu puerta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className={styles.section} style={{ background: '#ffffff' }}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaTitle}>¿Listo para darle vida a tu próximo proyecto?</h2>
            <p className={styles.ctaSubtitle}>
              Crea tu cuenta gratis hoy mismo para gestionar tus pedidos, recibir cotizaciones personalizadas y acumular puntos.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-cyan" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                ✨ Registrarme y Empezar
              </Link>
              <Link href="/catalogo" className="btn btn-outline-white" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                📦 Explorar Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
