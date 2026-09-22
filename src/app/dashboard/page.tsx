'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './dashboard.module.css';

interface Order {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'payment_confirmed' | 'in_production' | 'completed';
  date: string;
}

const initialDemoOrders: Order[] = [
  {
    id: 'AIM-1025',
    customer: 'Juan Pérez',
    email: 'juan@correo.com',
    items: [{ title: 'Soporte Gamer para Auriculares', quantity: 1, price: 950 }],
    total: 950,
    status: 'in_production',
    date: 'Hoy',
  },
  {
    id: 'AIM-1024',
    customer: 'Juan Pérez',
    email: 'juan@correo.com',
    items: [{ title: 'Dragón Mítico & Mecha 8K', quantity: 1, price: 1850 }],
    total: 1850,
    status: 'payment_confirmed',
    date: 'Ayer',
  },
];

export default function DashboardPage() {
  const [allOrders, setAllOrders] = useState<Order[]>(initialDemoOrders);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialDemoOrders);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aimprimir3d_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          const merged = [...parsed];
          initialDemoOrders.forEach((demo) => {
            if (!merged.some((m) => m.id === demo.id)) {
              merged.push(demo);
            }
          });
          setAllOrders(merged);
          setFilteredOrders(merged);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredOrders(allOrders);
      return;
    }
    const cleanQuery = searchQuery.trim().toLowerCase().replace('#', '');
    const results = allOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(cleanQuery) ||
        o.email.toLowerCase().includes(cleanQuery) ||
        o.customer.toLowerCase().includes(cleanQuery)
    );
    setFilteredOrders(results);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'payment_confirmed':
        return <span className={styles.statusBadgeConfirmed}>💳 Pago Confirmado</span>;
      case 'in_production':
        return <span className={styles.statusBadgeProduction}>🖨️ En Fabricación</span>;
      case 'completed':
        return <span className={styles.statusBadgeCompleted}>✅ Entregado / Listo</span>;
      default:
        return <span className={styles.statusBadgePending}>⏳ Pendiente de Pago</span>;
    }
  };

  return (
    <>
      <Navbar />

      <main className={`container ${styles.dashboardContainer}`}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.title}>Rastreo de Pedidos & Mis Encargos</h1>
          <p className={styles.subtitle}>
            Monitorea el progreso de fabricación en tiempo real y consulta los detalles de tus piezas.
          </p>
        </div>

        {/* CLIENT SEARCH / TRACKER BAR */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Ingresa tu número de encargo (ej. #AIM-1025) o correo electrónico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '980px',
                border: '1px solid #d2d2d7',
                fontSize: '0.95rem',
                outline: 'none',
                minWidth: '240px',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Buscar Pedido
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredOrders(allOrders);
                }}
                className="btn btn-outline-dark"
                style={{ padding: '12px 18px' }}
              >
                Ver Todos
              </button>
            )}
          </form>
        </div>

        <div className={styles.dashboardGrid}>
          {/* ORDERS LIST */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Encargos ({filteredOrders.length})</span>
              <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                + Nuevo Encargo
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOrders.map((ord) => (
                <div key={ord.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>Pedido #{ord.id}</span>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className={styles.orderItems}>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it, idx) => (
                        <div key={idx}>
                          • {it.quantity}x {it.title} (RD${(it.price * it.quantity).toLocaleString()})
                        </div>
                      ))
                    ) : (
                      <span>1x Pieza 3D a Medida</span>
                    )}
                  </div>

                  {/* VISUAL TIMELINE */}
                  <div className={styles.timeline}>
                    <div className={styles.timelineStep}>
                      <span className={`${styles.timelineDot} ${styles.timelineDotActive}`}></span>
                      <span>Recibido</span>
                    </div>
                    <div className={styles.timelineStep}>
                      <span
                        className={`${styles.timelineDot} ${
                          ord.status !== 'pending' ? styles.timelineDotActive : ''
                        }`}
                      ></span>
                      <span>Pago Verificado</span>
                    </div>
                    <div className={styles.timelineStep}>
                      <span
                        className={`${styles.timelineDot} ${
                          ord.status === 'in_production' || ord.status === 'completed'
                            ? styles.timelineDotActive
                            : ''
                        }`}
                      ></span>
                      <span>Fabricando</span>
                    </div>
                    <div className={styles.timelineStep}>
                      <span
                        className={`${styles.timelineDot} ${
                          ord.status === 'completed' ? styles.timelineDotActive : ''
                        }`}
                      ></span>
                      <span>Entregado</span>
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <span>Fecha: {ord.date}</span>
                    <strong style={{ color: '#1d1d1f' }}>
                      Total: RD${(ord.total || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#86868b' }}>
                  No se encontraron pedidos con ese número o correo.
                </div>
              )}
            </div>
          </div>

          {/* NOTIFICATIONS & WHATSAPP SUPPORT */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Atención y Soporte</h3>

            <div className={styles.notifList}>
              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>💬 Asistencia Directa</span>
                <p className={styles.notifDesc}>
                  ¿Tienes dudas sobre las medidas o materiales de tu encargo?
                </p>
                <a
                  href="https://wa.me/18494622228?text=Hola!%20Deseo%20consultar%20el%20estado%20de%20mi%20pedido%20en%20aImprimir3D."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  WhatsApp: 849-462-2228
                </a>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>💳 Confirmación de Transferencia</span>
                <p className={styles.notifDesc}>
                  Si realizaste una transferencia bancaria, envía tu comprobante para acelerar la puesta en marcha en la impresora.
                </p>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>📦 Tiempos de Entrega</span>
                <p className={styles.notifDesc}>
                  Los pedidos confirmados se procesan y entregan en un plazo promedio de 24 a 48 horas laborales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
