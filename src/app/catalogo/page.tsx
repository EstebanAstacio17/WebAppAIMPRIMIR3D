'use client';

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

const mockProducts = [
  {
    id: 1,
    title: "Dragón Mítico & Mecha Escultórico",
    description: "Impresión en resina UV 8K con detalles microscópicos, base de exposición y acabado ultra suave listo para pintar.",
    tiempo: "2-3 días",
    categoria: "Coleccionables",
    price: 1850,
    image: "/img/resin_figures.jpg",
    badge: "Resina 8K Ultra",
  },
  {
    id: 2,
    title: "Soporte Articulado Gamer para Headset & Mando",
    description: "Soporte ergonómico con canal organizador de cables y base antideslizante impreso en PLA+ de alta densidad.",
    tiempo: "1-2 días",
    categoria: "Accesorios",
    price: 950,
    image: "/img/slide1.png",
    badge: "Top Ventas",
  },
  {
    id: 3,
    title: "Lámpara Litofanía LED con Foto Personalizada",
    description: "Tu fotografía favorita convertida en relieve 3D que cobra vida al encender su base LED cálida integrada.",
    tiempo: "2-4 días",
    categoria: "Hogar",
    price: 1450,
    image: "/img/slide2.png",
    badge: "Personalizable",
  },
  {
    id: 4,
    title: "Repuesto de Engranaje Técnico Alta Carga",
    description: "Engranaje helicoidal/recto fabricado en PETG o Nylon técnico para repuestos de maquinaria, electrodomésticos o robótica.",
    tiempo: "1-2 días",
    categoria: "Industrial",
    price: 650,
    image: "/img/slide3.png",
    badge: "Mecánico",
  },
  {
    id: 5,
    title: "Prototipo de Carcasa Electrónica con Rosca",
    description: "Caja para proyectos Arduino/ESP32 con orificios de ventilación, puertos y tapas a presión.",
    tiempo: "2-3 días",
    categoria: "Industrial",
    price: 850,
    image: "/img/hero_printer.jpg",
    badge: "Prototipo",
  },
  {
    id: 6,
    title: "Llaveros y Merchandising Corporativo (Pack)",
    description: "Llaveros en relieve con el logo y colores de tu empresa, ideales para eventos y regalos promocionales.",
    tiempo: "3-5 días",
    categoria: "Accesorios",
    price: 1200,
    image: "/img/slide1.png",
    badge: "Lote",
  },
];

export default function Catalogo() {
  const [selectedCat, setSelectedCat] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");

  const categories = ["Todos", "Coleccionables", "Accesorios", "Hogar", "Industrial"];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCat = selectedCat === "Todos" || product.categoria === selectedCat;
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) ||
                          product.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <header className={styles.catalogoHeader}>
        <div className="container">
          <h1 className={styles.title}>Catálogo de Fabricación 3D</h1>
          <p className={styles.subtitle}>
            Explora nuestros modelos listos para imprimir o solicita piezas personalizadas con la mejor tecnología FDM y Resina 8K.
          </p>

          <div className={styles.searchBarContainer}>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, categoría o tipo de pieza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <main className="container">
        {/* FILTROS */}
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${selectedCat === cat ? styles.active : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className={styles.productImg}
                />
                <span className={styles.productBadge}>{product.badge}</span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.productCategory}>{product.categoria}</span>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.productMeta}>
                  <span>⏱️ Entrega: {product.tiempo}</span>
                  <span className={styles.productPrice}>RD${product.price.toLocaleString()}</span>
                </div>
                <Link
                  href={`/cart?add=${product.id}&title=${encodeURIComponent(product.title)}&price=${product.price}`}
                  className={`btn btn-primary ${styles.addToCart}`}
                >
                  🛒 Añadir al Encargo
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <h3>No se encontraron productos para tu búsqueda</h3>
            <p style={{ marginTop: "10px" }}>¿Necesitas una pieza que no está aquí? ¡Cotízala a medida!</p>
            <Link href="/#cotizador" className="btn btn-primary" style={{ marginTop: "20px" }}>
              ⚡ Ir al Cotizador a Medida
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
