'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  const featuredProducts = [
    {
      id: 1,
      title: "Dragón Mítico & Mecha 8K",
      desc: "Máximo nivel de detalle en resina gris espacial de alta definición.",
      price: 1850,
      image: "/img/resin_figures.jpg",
      category: "Coleccionables",
    },
    {
      id: 2,
      title: "Soporte Gamer para Auriculares",
      desc: "Diseño ergonómico y resistente en filamento reforzado de alta durabilidad.",
      price: 950,
      image: "/img/slide1.png",
      category: "Accesorios",
    },
    {
      id: 3,
      title: "Lámpara Litofanía con Foto",
      desc: "Tu fotografía cobra vida en relieve tridimensional al encender la luz.",
      price: 1450,
      image: "/img/slide2.png",
      category: "Hogar & Regalos",
    },
  ];

  return (
    <>
      <Navbar />

      {/* 1. HERO SECTION: CLEAN, CONFIDENT & MINIMALIST (NO RAW PRINTERS) */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className="status-dot"></span>
              Ingeniería y Fabricación Digital a Medida
            </div>

            <h1 className={styles.heroHeadline}>
              De tu idea al objeto real, <br />
              <span className={styles.heroHeadlineSpan}>con precisión y calidad garantizada.</span>
            </h1>

            <p className={styles.heroDescription}>
              Materializamos prototipos de ingeniería, repuestos técnicos y productos personalizados con tolerancias exactas, acabado profesional y asesoría directa en cada paso.
            </p>

            {/* Micro Trust Pills */}
            <div className={styles.trustPills}>
              <span className={styles.trustPillItem}>
                ✓ Tolerancia milimétrica (±0.05 mm)
              </span>
              <span className={styles.trustPillItem}>
                ✓ Revisión técnica de archivos sin costo
              </span>
              <span className={styles.trustPillItem}>
                ✓ Envíos asegurados a todo el país
              </span>
            </div>

            <div className={styles.heroActions}>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Quiero%20cotizar%20un%20proyecto%20de%20fabricacion%20o%20impresion%203D."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '14px 30px', fontSize: '0.98rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Cotizar Proyecto por WhatsApp
              </a>
              <Link href="/catalogo" className="btn btn-outline-titanium" style={{ padding: '14px 28px', fontSize: '0.98rem' }}>
                Explorar Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & GUARANTEE SECTION (WHY CLIENTS FEEL SAFE WITH US) */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Revisión Técnica Gratis</h3>
              <p className={styles.trustCardDesc}>
                Analizamos y optimizamos la geometría de tu archivo 3D antes de fabricar para garantizar un encaje perfecto.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Materiales Certificados</h3>
              <p className={styles.trustCardDesc}>
                Resinas 8K de alto detalle, PETG, ABS y filamentos técnicos de alto impacto seleccionados según tu necesidad.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Envíos Rápidos & Seguros</h3>
              <p className={styles.trustCardDesc}>
                Embalaje reforzado con protección multicapa y número de seguimiento hasta la puerta de tu casa u oficina.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Garantía de Satisfacción</h3>
              <p className={styles.trustCardDesc}>
                Si una pieza presenta cualquier defecto de fabricación, la corregimos o reimprimimos de inmediato sin costo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRES SOLUCIONES CLARAS (SIN SATURACIÓN) */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Capacidades</span>
            <h2 className={styles.sectionTitle}>Soluciones a tu medida</h2>
            <p className={styles.sectionSubtitle}>
              Ya sea una pieza de ingeniería o un regalo único, fabricamos exactamente lo que necesitas.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            {/* PILAR 1 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Prototipos & Repuestos</h3>
              <p className={styles.pillarDesc}>
                Fabricación de piezas mecánicas resistentes a la fricción, impacto o temperatura en PETG, ABS y Nylon para maquinaria o reemplazos difíciles de encontrar.
              </p>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Quiero%20cotizar%20un%20repuesto%20o%20pieza%20mecanica."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillarLink}
              >
                Cotizar pieza a medida →
              </a>
            </div>

            {/* PILAR 2 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v18l6-4 6 4V3z"/>
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Figuras & Coleccionables</h3>
              <p className={styles.pillarDesc}>
                Detalle microscópico y textura suave gracias a nuestra tecnología de resina UV 8K. Perfecto para exhibición, pintura de miniaturas y réplicas.
              </p>
              <Link href="/catalogo" className={styles.pillarLink}>
                Ver opciones en catálogo →
              </Link>
            </div>

            {/* PILAR 3 */}
            <div className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v10H4V12"/>
                  <path d="M2 7h20v5H2z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Regalos & Personalizados</h3>
              <p className={styles.pillarDesc}>
                Lámparas litofanía con tus fotos familiares, llaveros y placas corporativas con logotipo, y piezas de diseño listas para sorprender.
              </p>
              <Link href="/catalogo" className={styles.pillarLink}>
                Explorar personalizados →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE DE PRODUCTOS DESTACADOS */}
      <section className={styles.showcaseSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Disponibles Ahora</span>
            <h2 className={styles.sectionTitle}>Modelos Más Solicitados</h2>
            <p className={styles.sectionSubtitle}>
              Calidad y acabado verificado listos para ordenar directamente.
            </p>
          </div>

          <div className={styles.productsGrid}>
            {featuredProducts.map((p) => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.productImgBox}>
                  <span className={styles.productCategoryBadge}>{p.category}</span>
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className={styles.productImg}
                  />
                </div>
                <div className={styles.productBody}>
                  <h4 className={styles.productTitle}>{p.title}</h4>
                  <p className={styles.productDesc}>{p.desc}</p>
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>RD${p.price.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          title: p.title,
                          price: p.price,
                          image: p.image,
                          category: p.category,
                        })
                      }
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                    >
                      + Encargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CÓMO FUNCIONA (SIMPLE Y TRANSPARENTE) */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Paso a Paso</span>
            <h2 className={styles.sectionTitle}>Proceso claro y sin complicaciones</h2>
            <p className={styles.sectionSubtitle}>
              Desde tu consulta hasta la entrega en tus manos.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Envía tu Idea o Archivo</h3>
              <p className={styles.stepDesc}>
                Cuéntanos qué necesitas fabricar, comparte tu modelo 3D (STL/OBJ/STEP) o envíanos fotos y medidas de referencia.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Asesoría y Fabricación</h3>
              <p className={styles.stepDesc}>
                Te recomendamos el material y acabado ideal, confirmamos el presupuesto exacto y producimos tu pedido con control de calidad.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Recibe en tu Puerta</h3>
              <p className={styles.stepDesc}>
                Empacamos tu pieza con protección multicapa y la enviamos a cualquier punto del país con número de guía.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>¿Tienes un proyecto o pieza en mente?</h2>
            <p className={styles.ctaSubtitle}>
              Habla directamente con un técnico para asesorarte sobre materiales, cotización y tiempos de entrega.
            </p>
            <div className={styles.ctaActions}>
              <a
                href="https://wa.me/18494622228?text=Hola!%20Tengo%20una%20idea%20o%20proyecto%20para%20cotizar."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                💬 Iniciar Consulta por WhatsApp
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
