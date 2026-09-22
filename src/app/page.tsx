import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* 1. HERO (APPLE & COCA-COLA STYLE: BOLD, ICONIC & MINIMALIST) */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Taller de Fabricación Digital</span>
            
            <h1 className={styles.heroHeadline}>
              Ideas que se imprimen. <br />
              <span className={styles.heroHeadlineSpan}>Soluciones que se crean.</span>
            </h1>

            <p className={styles.heroDescription}>
              Convertimos tus diseños 3D en piezas reales con tecnología de alta precisión. Desde figuras en resina 8K hasta repuestos funcionales bajo demanda.
            </p>

            <div className={styles.heroActions}>
              <Link href="/catalogo" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Explorar Catálogo
              </Link>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Quiero%20cotizar%20un%20proyecto%20de%20impresion%203D."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-titanium"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Cotizar por WhatsApp
              </a>
            </div>

            {/* CINEMATIC SHOWCASE */}
            <div className={styles.heroVisual}>
              <Image
                src="/img/hero_printer.jpg"
                alt="Impresión 3D de Alta Precisión"
                fill
                className={styles.heroImg}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRES PILARES ESENCIALES (SIMPLE & FUNCIONAL) */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={styles.pillarsGrid}>
            {/* PILAR 1 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>🧪</div>
              <h3 className={styles.pillarTitle}>Figuras & Coleccionables</h3>
              <p className={styles.pillarDesc}>
                Detalle microscópico y acabado ultra suave con tecnología de resina UV 8K. Perfecto para pintura, anime y exhibición.
              </p>
              <Link href="/catalogo" className={styles.pillarLink}>
                Ver opciones en catálogo →
              </Link>
            </div>

            {/* PILAR 2 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>⚙️</div>
              <h3 className={styles.pillarTitle}>Prototipos & Repuestos</h3>
              <p className={styles.pillarDesc}>
                Fabricación de piezas mecánicas resistentes en PETG, ABS y Nylon para ingeniería, maquinaria o reemplazos.
              </p>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Quiero%20cotizar%20un%20repuesto%20o%20pieza%20tecnica."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillarLink}
              >
                Cotizar pieza a medida →
              </a>
            </div>

            {/* PILAR 3 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>🎁</div>
              <h3 className={styles.pillarTitle}>Regalos & Personalizados</h3>
              <p className={styles.pillarDesc}>
                Lámparas litofanía con tus fotos, llaveros corporativos con logo y artículos especiales diseñados a tu medida.
              </p>
              <Link href="/catalogo" className={styles.pillarLink}>
                Explorar personalizados →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE DESTACADO (PRODUCTOS POPULARES) */}
      <section className={styles.showcaseSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Modelos Destacados</h2>
            <p className={styles.sectionSubtitle}>
              Calidad profesional probada lista para encargar hoy mismo.
            </p>
          </div>

          <div className={styles.productsGrid}>
            {/* PRODUCTO 1 */}
            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/resin_figures.jpg"
                  alt="Dragón Mítico Resina 8K"
                  fill
                  className={styles.productImg}
                />
              </div>
              <div className={styles.productBody}>
                <h4 className={styles.productTitle}>Dragón Mítico & Mecha 8K</h4>
                <p className={styles.productDesc}>Máximo nivel de detalle en resina gris espacial.</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>RD$1,850</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Encargar
                  </Link>
                </div>
              </div>
            </div>

            {/* PRODUCTO 2 */}
            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide1.png"
                  alt="Soporte Gamer"
                  fill
                  className={styles.productImg}
                />
              </div>
              <div className={styles.productBody}>
                <h4 className={styles.productTitle}>Soporte Gamer para Auriculares</h4>
                <p className={styles.productDesc}>Diseño ergonómico y resistente en PLA+ reforzado.</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>RD$950</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Encargar
                  </Link>
                </div>
              </div>
            </div>

            {/* PRODUCTO 3 */}
            <div className={styles.productCard}>
              <div className={styles.productImgBox}>
                <Image
                  src="/img/slide2.png"
                  alt="Lámpara Litofanía"
                  fill
                  className={styles.productImg}
                />
              </div>
              <div className={styles.productBody}>
                <h4 className={styles.productTitle}>Lámpara Litofanía con Foto</h4>
                <p className={styles.productDesc}>Tu imagen cobra vida en relieve 3D al encender la luz.</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>RD$1,450</span>
                  <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Encargar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CÓMO FUNCIONA (3 PASOS ULTRA SIMPLES) */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Simple de principio a fin</h2>
            <p className={styles.sectionSubtitle}>
              Pedir una pieza 3D nunca fue tan fácil.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Elige o Envía tu Idea</h3>
              <p className={styles.stepDesc}>
                Elige un modelo del catálogo o envíanos tu archivo STL / foto de lo que necesitas.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Cotización y Fabricación</h3>
              <p className={styles.stepDesc}>
                Te confirmamos el costo y material, e iniciamos la impresión en nuestro taller.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Recibe en tu Puerta</h3>
              <p className={styles.stepDesc}>
                Enviamos tu pedido a cualquier punto del país con número de seguimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FINAL (ICONIC & DIRECT) */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>¿Tienes una idea en mente?</h2>
            <p className={styles.ctaSubtitle}>
              Escríbenos directamente o crea tu cuenta para comenzar a fabricar hoy.
            </p>
            <div className={styles.ctaActions}>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Tengo%20una%20idea%20para%20imprimir%20en%203D."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                💬 Escribir por WhatsApp
              </a>
              <Link href="/catalogo" className="btn btn-white" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Ver Todo el Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
