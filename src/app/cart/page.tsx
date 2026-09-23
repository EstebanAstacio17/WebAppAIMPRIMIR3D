'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './cart.module.css';
import { useCart } from '@/context/CartContext';
import { Order } from '@/types/product';
import { createNewOrder } from '@/utils/orderStorage';
import { getCurrentUser } from '@/utils/authRoles';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, []);

  const hasOnDemandItems = items.some((it) => it.stockType === 'on_demand');

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    const orderId = `AIM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customer: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      items: items.map((it) => ({
        productId: it.id,
        title: it.title,
        quantity: it.quantity,
        unitPrice: it.price,
        price: it.price * it.quantity,
        image: it.image,
        stockType: it.stockType,
      })),
      total: totalPrice,
      status: 'pending',
      date: new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    // Crear pedido en almacén central y deducir existencias en almacén en tiempo real
    createNewOrder(newOrder);

    setTimeout(() => {
      setLoading(false);
      setSubmittedOrder(orderId);
      clearCart();
    }, 600);
  };

  return (
    <>
      <Navbar />

      <main className={`container ${styles.cartContainer}`}>
        <div className={styles.cartHeader}>
          <h1 className={styles.title}>Tu Carrito de Encargos</h1>
          <p className={styles.subtitle}>
            Revisa tus artículos con descuentos automáticos por volumen y completa tus datos de entrega.
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.cartGrid}>
            {/* ITEMS LIST */}
            <div className={styles.itemsCard}>
              <div className={styles.cardTitle}>
                <span>Artículos Seleccionados ({items.length})</span>
                <button type="button" onClick={clearCart} className={styles.clearBtn}>
                  Vaciar Carrito
                </button>
              </div>

              <div className={styles.itemList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemImgBox}>
                        <Image
                          src={item.image || '/img/slide1.png'}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                          {item.stockType === 'in_stock' ? (
                            <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '980px', fontWeight: 600 }}>
                              🟢 En Existencia
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '980px', fontWeight: 600 }}>
                              ⏳ Bajo Encargo
                            </span>
                          )}
                        </div>
                        <h4 className={styles.itemTitle}>{item.title}</h4>
                        <p className={styles.itemPrice}>
                          RD${item.price.toLocaleString()} c/u
                          {item.quantity > 1 && (
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '6px' }}>
                              (Subtotal: RD${(item.price * item.quantity).toLocaleString()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.qtyControls}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className={styles.qtyBtn}
                      >
                        -
                      </button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className={styles.qtyBtn}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className={styles.deleteBtn}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* NOTICE IF HAS ON DEMAND ITEMS */}
              {hasOnDemandItems && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>ℹ️ Nota sobre productos Bajo Encargo:</strong> Los modelos bajo encargo se fabrican a medida una vez confirmado el pedido (tiempo estándar: 2 a 4 días hábiles con control de calidad).
                </div>
              )}
            </div>

            {/* CHECKOUT FORM */}
            <form onSubmit={handleSubmitOrder} className={styles.summaryCard}>
              <h3 className={styles.cardTitle}>Datos de Entrega & Contacto</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="849-000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Dirección de Envío o Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ciudad, Sector, Calle o Retiro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Notas o Enlace de Archivo 3D (Opcional)</label>
                <input
                  type="text"
                  placeholder="Color preferido, especificaciones técnicas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.totalRow}>
                <span>Total Estimado:</span>
                <span style={{ color: '#0071e3' }}>RD${totalPrice.toLocaleString()}</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#86868b', lineHeight: 1.4 }}>
                ℹ️ Al confirmar el encargo, el equipo de aImprimir3D se comunicará contigo vía WhatsApp para confirmar métodos de pago (transferencia / depósito) e iniciar la producción o despacho.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {loading ? 'Procesando encargo...' : '⚡ Confirmar y Enviar Encargo'}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span style={{ fontSize: '3.5rem' }}>🛒</span>
            <h2>Tu carrito está vacío</h2>
            <p style={{ color: '#86868b' }}>Explora nuestro catálogo para encargar piezas listas o a medida.</p>
            <Link href="/catalogo" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Explorar Catálogo de Productos
            </Link>
          </div>
        )}

        {/* ORDER SUCCESS MODAL */}
        {submittedOrder && (
          <div className={styles.successModal}>
            <div className={`${styles.modalBox} animate-fade-in`}>
              <span style={{ fontSize: '3.5rem' }}>🎉</span>
              <h2 style={{ fontSize: '1.8rem', color: '#1d1d1f' }}>¡Encargo Recibido con Éxito!</h2>
              <p style={{ color: '#86868b', fontSize: '0.95rem' }}>
                Tu pedido <strong>#{submittedOrder}</strong> ha sido registrado en nuestro taller. Las existencias han sido reservadas y el equipo de aImprimir3D ya puede gestionarlo en su panel.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Ver en Mis Pedidos
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmittedOrder(null)}
                  className="btn btn-outline-dark"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
