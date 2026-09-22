'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './cart.module.css';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    const orderId = `AIM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customer: name,
      email,
      phone,
      address,
      notes,
      items: [...items],
      total: totalPrice,
      status: 'pending',
      date: new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    // Save to LocalStorage mock database so dashboard & admin immediately reflect it
    try {
      const existingOrders = JSON.parse(localStorage.getItem('aimprimir3d_orders') || '[]');
      existingOrders.unshift(newOrder);
      localStorage.setItem('aimprimir3d_orders', JSON.stringify(existingOrders));
    } catch (err) {
      console.error('Error storing order:', err);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmittedOrder(orderId);
      clearCart();
    }, 800);
  };

  return (
    <>
      <Navbar />

      <main className={`container ${styles.cartContainer}`}>
        <div className={styles.cartHeader}>
          <h1 className={styles.title}>Tu Carrito de Encargos</h1>
          <p className={styles.subtitle}>
            Revisa tus artículos y completa la información para enviar tu pedido a nuestro taller.
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
                        <h4 className={styles.itemTitle}>{item.title}</h4>
                        <p className={styles.itemPrice}>RD${item.price.toLocaleString()} c/u</p>
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
                  placeholder="Color preferido, enlace Drive, detalles"
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
                ℹ️ Al confirmar el encargo, nos comunicaremos contigo vía WhatsApp y correo para verificar los detalles y proporcionarte los métodos de pago (transferencia / depósito).
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
            <p style={{ color: '#86868b' }}>Explora nuestro catálogo o cotiza una pieza para comenzar tu encargo.</p>
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
                Tu pedido <strong>#{submittedOrder}</strong> ha sido registrado en nuestro taller. Te contactaremos vía WhatsApp para coordinar la fabricación y el pago.
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
