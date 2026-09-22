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

interface UserSession {
  name: string;
  email: string;
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
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>(initialDemoOrders);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialDemoOrders);

  useEffect(() => {
    // 1. Check client session
    try {
      const userStr = localStorage.getItem('aimprimir3d_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    // 2. Load orders
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

  const handleLogout = () => {
    try {
      localStorage.removeItem('aimprimir3d_user');
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

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

  if (loading) {
    return null;
  }

  // 1. CLIENT AUTH GATE (IF NOT LOGGED IN)
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <main className={`container ${styles.dashboardContainer}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={`${styles.card} animate-fade-in`} style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>
            <span style={{ fontSize: '3.5rem' }}>🔐</span>
            <h2 style={{ fontSize: '1.7rem', color: '#1d1d1f', marginTop: '12px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Rastreo de Pedidos
            </h2>
            <p style={{ color: '#86868b', fontSize: '0.95rem', marginTop: '8px', marginBottom: '28px', lineHeight: 1.5 }}>
              Para ver el estado de fabricación en tiempo real y el historial de tus pedidos, por favor inicia sesión o crea una cuenta.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}>
                Iniciar Sesión
              </Link>
              <Link href="/auth/register" className="btn btn-outline-dark" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}>
                Crear Cuenta Gratis
              </Link>
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link href="/" style={{ color: '#86868b', fontSize: '0.85rem' }}>
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 2. LOGGED IN CLIENT DASHBOARD
  return (
    <>
      <Navbar />

      <main className={`container ${styles.dashboardContainer}`}>
        <div className={styles.dashboardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className={styles.title}>Mis Encargos & Rastreo</h1>
            <p className={styles.subtitle}>
              Bienvenido, <strong>{currentUser.name}</strong> ({currentUser.email}). Aquí puedes ver el estado de tus piezas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-dark"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* CLIENT SEARCH / TRACKER BAR */}
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por ID de encargo (ej. #AIM-1025)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '980px',
                border: '1px solid #d2d2d7',
                fontSize: '0.92rem',
                outline: 'none',
                minWidth: '220px',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '11px 22px', fontSize: '0.9rem' }}>
              Buscar
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredOrders(allOrders);
                }}
                className="btn btn-outline-dark"
                style={{ padding: '11px 16px', fontSize: '0.9rem' }}
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
              <span>Tus Pedidos ({filteredOrders.length})</span>
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
                  No tienes pedidos registrados con ese criterio.
                </div>
              )}
            </div>
          </div>

          {/* SUPPORT & WHATSAPP */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Asistencia & Soporte</h3>

            <div className={styles.notifList}>
              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>💬 Soporte Técnico Directo</span>
                <p className={styles.notifDesc}>
                  ¿Deseas modificar un diseño o consultar detalles sobre tu entrega?
                </p>
                <a
                  href="https://wa.me/18494622228?text=Hola!%20Soy%20cliente%20de%20aImprimir3D%20y%20tengo%20una%20consulta."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  WhatsApp: 849-462-2228
                </a>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>💳 Confirmación de Pago</span>
                <p className={styles.notifDesc}>
                  Si realizaste una transferencia bancaria, envía tu comprobante para iniciar la producción de inmediato.
                </p>
              </div>

              <div className={styles.notifItem}>
                <span className={styles.notifTitle}>📦 Tiempos de Entrega</span>
                <p className={styles.notifDesc}>
                  Tiempo promedio de 24 a 48 horas una vez confirmado el pago.
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
