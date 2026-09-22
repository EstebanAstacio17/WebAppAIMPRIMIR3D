import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";

// Mock data para el prototipo visual
const mockProducts = [
  {
    id: 1,
    title: "Llaveros Personalizados 3D",
    description: "Llaveros con tu nombre, logo de empresa o diseño especial. Múltiples colores disponibles.",
    tiempo: "2-3 días",
    categoria: "Accesorios",
  },
  {
    id: 2,
    title: "Soporte para Celular/Tablet",
    description: "Soporte ergonómico e inclinable, ideal para escritorio. Fuerte y duradero.",
    tiempo: "1-2 días",
    categoria: "Oficina",
  },
  {
    id: 3,
    title: "Maceta Geométrica Minimalista",
    description: "Maceta de diseño moderno para suculentas o plantas pequeñas. Material resistente.",
    tiempo: "3-4 días",
    categoria: "Hogar",
  },
  {
    id: 4,
    title: "Figura de Acción a Medida",
    description: "Impresión en resina de alta definición para figuras de colección o juegos de mesa.",
    tiempo: "5-7 días",
    categoria: "Coleccionables",
  },
  {
    id: 5,
    title: "Repuesto de Engranaje",
    description: "Diseño e impresión de piezas mecánicas de repuesto a medida.",
    tiempo: "3-5 días",
    categoria: "Industrial",
  },
  {
    id: 6,
    title: "Trofeo Personalizado",
    description: "Trofeos corporativos o para eventos deportivos con texto en relieve.",
    tiempo: "4-6 días",
    categoria: "Eventos",
  }
];

export default function Catalogo() {
  return (
    <>
      <Navbar />

      <header className={styles.catalogoHeader}>
        <div className="container">
          <h1 className={styles.title}>Nuestro Catálogo</h1>
          <p className={styles.subtitle}>
            Explora nuestras opciones de impresión y diseño 3D. Encuentra la solución perfecta o contáctanos para un proyecto a medida.
          </p>
        </div>
      </header>

      <main className="container" style={{ paddingTop: "20px" }}>
        
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${styles.active}`}>Todos</button>
          <button className={styles.filterBtn}>Accesorios</button>
          <button className={styles.filterBtn}>Oficina</button>
          <button className={styles.filterBtn}>Hogar</button>
          <button className={styles.filterBtn}>Industrial</button>
          <button className={styles.filterBtn}>Coleccionables</button>
        </div>

        <div className={styles.grid}>
          {mockProducts.map((product) => (
            <div key={product.id} className={`${styles.productCard} glass`}>
              <div className={styles.imageContainer}>
                {/* Placeholder para la imagen del producto */}
                <div className={styles.imagePlaceholder}>📦</div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.productMeta}>
                  <span>⏱️ {product.tiempo}</span>
                  <span>🏷️ {product.categoria}</span>
                </div>
                <button className={`btn btn-primary ${styles.addToCart}`}>
                  Añadir al Encargo
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </>
  );
}
