'use client';

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { getStoredProducts, calculateUnitPrice } from "@/utils/productStorage";
import { getCurrentUser, isUserAdmin } from "@/utils/authRoles";

export default function Catalogo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [selectedPolicyProduct, setSelectedPolicyProduct] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { addToCart } = useCart();

  useEffect(() => {
    // Load products
    const loaded = getStoredProducts();
    setProducts(loaded);

    // Initial quantities = 1 for all products
    const initialQty: Record<string | number, number> = {};
    loaded.forEach((p) => {
      initialQty[p.id] = 1;
    });
    setQuantities(initialQty);

    // Check admin role
    const user = getCurrentUser();
    setIsAdmin(isUserAdmin(user));

    const handleProductsUpdated = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('aimprimir3d_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('aimprimir3d_products_updated', handleProductsUpdated);
    };
  }, []);

  const categories = ["Todos", "Coleccionables", "Accesorios", "Hogar", "Industrial"];

  const filteredProducts = products.filter((product) => {
    const matchesCat = selectedCat === "Todos" || product.categoria === selectedCat;
    const matchesSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleQtyChange = (productId: string | number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddProduct = (product: Product) => {
    const qty = quantities[product.id] || 1;
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.categoria,
      stockType: product.stockType,
      stockQuantity: product.stockQuantity,
      volumePricing: product.volumePricing,
      onDemandPolicies: product.onDemandPolicies,
      quantity: qty,
    });
  };

  return (
    <>
      <Navbar />

      <header className={styles.catalogoHeader}>
        <div className="container">
          <h1 className={styles.title}>Catálogo de Fabricación 3D</h1>
          <p className={styles.subtitle}>
            Piezas en existencia listas para entrega inmediata y modelos personalizados fabricados bajo demanda con la más alta precisión.
          </p>

          <div className={styles.searchBarContainer}>
            <input
              type="text"
              placeholder="Buscar modelos, repuestos, figuras o accesorios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <main className="container">
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`${styles.filterBtn} ${selectedCat === cat ? styles.active : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredProducts.map((product) => {
            const currentQty = quantities[product.id] || 1;
            const currentUnitPrice = calculateUnitPrice(product, currentQty);

            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  {/* STOCK STATUS BADGE */}
                  {product.stockType === 'in_stock' ? (
                    <span className={styles.stockBadgeInStock}>
                      🟢 En Existencia ({product.stockQuantity} disponibles)
                    </span>
                  ) : (
                    <span className={styles.stockBadgeOnDemand}>
                      ⏳ Fabricación Bajo Encargo
                    </span>
                  )}

                  {/* ADMIN EDIT BADGE - VISIBLE ONLY TO AIMPRIMIR3D STAFF */}
                  {isAdmin && (
                    <Link
                      href={`/admin?editProductId=${product.id}`}
                      className={styles.adminEditBadge}
                      title="Editar este producto en el panel de aImprimir3D"
                    >
                      ✏️ Editar
                    </Link>
                  )}

                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className={styles.productImg}
                  />
                </div>

                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.productCategory}>{product.categoria}</span>
                    <span style={{ fontSize: '0.8rem', color: '#86868b' }}>⏱️ {product.tiempo}</span>
                  </div>

                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDesc}>{product.description}</p>

                  {/* PRECIOS POR VOLUMEN / ESCALONADOS */}
                  {product.volumePricing && product.volumePricing.length > 0 && (
                    <div className={styles.volumeTiersBox}>
                      <div className={styles.volumeTiersTitle}>💰 Descuento por Volumen:</div>
                      <div className={styles.tiersGrid}>
                        {product.volumePricing.map((tier, idx) => {
                          const isTierActive =
                            currentQty >= tier.minQty && currentQty <= (tier.maxQty || Infinity);
                          return (
                            <span
                              key={idx}
                              className={`${styles.tierChip} ${
                                isTierActive ? styles.tierChipActive : ''
                              }`}
                            >
                              <strong>
                                {tier.minQty}
                                {tier.maxQty && tier.maxQty < 999 ? `-${tier.maxQty}` : '+'}u:
                              </strong>{' '}
                              RD${tier.price.toLocaleString()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ENLACE A POLÍTICAS DE ENCARGO */}
                  {product.stockType === 'on_demand' && product.onDemandPolicies && (
                    <button
                      type="button"
                      onClick={() => setSelectedPolicyProduct(product)}
                      className={styles.policyBtn}
                    >
                      📜 Ver políticas y plazos de encargo →
                    </button>
                  )}

                  <div className={styles.productMeta}>
                    <div className={styles.priceCol}>
                      <span className={styles.productPrice}>
                        RD${currentUnitPrice.toLocaleString()}
                      </span>
                      {currentQty > 1 && (
                        <span className={styles.priceNote}>
                          Total: RD${(currentUnitPrice * currentQty).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className={styles.qtyRow}>
                      <div className={styles.qtyPicker}>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, -1)}
                          className={styles.qtyBtn}
                        >
                          -
                        </button>
                        <span className={styles.qtyVal}>{currentQty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, 1)}
                          className={styles.qtyBtn}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className={`btn btn-primary ${styles.addToCart}`}
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#86868b' }}>
            No se encontraron productos que coincidan con tu búsqueda.
          </div>
        )}
      </main>

      {/* MODAL DE POLÍTICAS DE ENCARGO */}
      {selectedPolicyProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPolicyProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#0071e3', fontWeight: 600, textTransform: 'uppercase' }}>
                  Fabricación Bajo Pedido
                </span>
                <h3 className={styles.modalTitle}>{selectedPolicyProduct.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPolicyProduct(null)}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Este producto se fabrica exclusivamente para ti según las especificaciones acordadas. A continuación se detallan las condiciones de producción:
            </p>

            <div className={styles.policyList}>
              {selectedPolicyProduct.onDemandPolicies?.map((policy, idx) => (
                <div key={idx} className={styles.policyItem}>
                  <span className={styles.policyItemIcon}>✓</span>
                  <span>{policy}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  handleAddProduct(selectedPolicyProduct);
                  setSelectedPolicyProduct(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                Aceptar y Añadir al Encargo
              </button>
              <button
                type="button"
                onClick={() => setSelectedPolicyProduct(null)}
                className="btn btn-outline-dark"
                style={{ padding: '12px 18px' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
