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
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'payment_confirmed' | 'in_production' | 'completed';
  date: string;
}

const defaultOrders: Order[] = [
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
  const [orders, setOrders] = useState<Order[]>(defaultOrders);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aimprimir3d_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setOrders(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'payment_confirmed':
        return <span className={styles.statusBadgeConfirmed}>Pago Confirmado</span>;
      case 'in_production':
        return <span className={styles.statusBadgeProduction}>En Fabricación</span>;
      case 'completed':
        return <span className={styles.statusBadgeCompleted}>Completado</span>;
      default:
        return <span className={styles.statusBadgePending}>Pendiente de Cotización</span>;
    }
  };

  return (
    <>
      <Navbar />

      <main className={`container ${styles.dashboardContainer}`}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.title}>Panel de Control & Pedidos</h1>
          <p className={styles.subtitle}>
            Consulta el estado de fabricación en tiempo real y gestiona tus encargos.
          </p>
        </div>

        <div className={styles.dashboardGrid}>
          {/* ORDERS LIST */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Tus Encargos Recientes ({orders.length})</span>
              <Link href="/catalogo" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                + Nuevo Encargo
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <div key={ord.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>Encargo #{ord.id}</span>
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
                      <span>Pago Confirmado</span>
                    </div>
                    <div className={styles.timelineStep}>
                      <span
                        className={`${styles.timelineDot} ${
                          ord.status === 'in_production' || ord.status === 'completed'
                            ? styles.timelineDotActive
                            : ''
                        }`}
                      ></span>
                      <span>Imprimiendo</span>
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
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Notificaciones & Estado</h3>

            <div className={styles.notifList}>
              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>🟢 Taller en Operación</span>
                <p className={styles.notifDesc}>
                  Todas las impresoras están calibradas. Los encargos enviados hoy se despachan en 24-48 horas.
                </p>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>💳 Confirmación de Pagos</span>
                <p className={styles.notifDesc}>
                  Recuerda enviar tu comprobante de transferencia al WhatsApp oficial para iniciar producción inmediata.
                </p>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>✨ Bienvenida a aImprimir3D</span>
                <p className={styles.notifDesc}>
                  Gracias por confiar en nosotros para hacer realidad tus ideas capa por capa.
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
