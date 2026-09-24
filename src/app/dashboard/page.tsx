'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './dashboard.module.css';
import { Order } from '@/types/product';
import { getStoredOrders, cancelOrderById, syncOrdersFromApi } from '@/utils/orderStorage';
import { getCurrentUser, logoutUser, isUserAdmin } from '@/utils/authRoles';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const loadDashboardData = async () => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const updateViewWithOrders = (ordersList: Order[]) => {
      setAllOrders(ordersList);
      if (user && user.email) {
        const clientEmail = user.email.toLowerCase().trim();
        const userOrders = ordersList.filter(
          (o) =>
            (o.email && o.email.toLowerCase().trim() === clientEmail) ||
            (user.name && o.customer && o.customer.toLowerCase().includes(user.name.toLowerCase()))
        );
        setFilteredOrders(userOrders.length > 0 ? userOrders : ordersList);
      } else {
        setFilteredOrders(ordersList);
      }
    };

    // 1. Initial cached view
    const cachedOrders = getStoredOrders();
    updateViewWithOrders(cachedOrders);

    // 2. Live sync from MongoDB Atlas
    try {
      const liveOrders = await syncOrdersFromApi(user?.email);
      if (liveOrders && Array.isArray(liveOrders)) {
        updateViewWithOrders(liveOrders);
      }
    } catch (e) {
      console.warn('Error fetching live client orders:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
    setLoading(false);

    // Polling every 5 seconds for status changes made by Admin
    const pollInterval = setInterval(() => {
      const user = getCurrentUser();
      syncOrdersFromApi(user?.email)
        .then((liveOrders) => {
          if (liveOrders && Array.isArray(liveOrders)) {
            setAllOrders(liveOrders);
            if (user && user.email) {
              const clientEmail = user.email.toLowerCase().trim();
              const userOrders = liveOrders.filter(
                (o) =>
                  (o.email && o.email.toLowerCase().trim() === clientEmail) ||
                  (user.name && o.customer && o.customer.toLowerCase().includes(user.name.toLowerCase()))
              );
              setFilteredOrders(userOrders.length > 0 ? userOrders : liveOrders);
            } else {
              setFilteredOrders(liveOrders);
            }
          }
        })
        .catch(() => {});
    }, 5000);

    const handleOrdersUpdated = () => {
      loadDashboardData();
    };

    window.addEventListener('aimprimir3d_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);
    window.addEventListener('focus', handleOrdersUpdated);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('aimprimir3d_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
      window.removeEventListener('focus', handleOrdersUpdated);
    };
  }, []);

  const handleCancelClientOrder = async (orderId: string) => {
    if (confirm(`¿Estás seguro de que deseas cancelar tu pedido #${orderId}?`)) {
      await cancelOrderById(orderId);
      await loadDashboardData();
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadDashboardData();
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
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '980px', fontSize: '0.8rem', fontWeight: 600 }}>❌ Cancelado</span>;
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
              Para ver el estado de fabricación en tiempo real y el historial de tus pedidos, por favor inicia sesión con Google.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}>
                Iniciar Sesión con Google
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

  const isAdmin = isUserAdmin(currentUser);

  // 2. LOGGED IN CLIENT / ADMIN DASHBOARD
  return (
    <>
      <Navbar />

      <main className={`container ${styles.dashboardContainer}`}>
        {/* ADMIN NOTIFICATION BANNER */}
        {isAdmin && (
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '1.5px solid #38bdf8',
              borderRadius: '20px',
              padding: '18px 24px',
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(56, 189, 248, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#f8fafc' }}>
              <span style={{ fontSize: '2rem' }}>👑</span>
              <div>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem', display: 'block' }}>
                  Sesión de Administrador / Personal Activa ({currentUser.email})
                </strong>
                <span style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
                  Tienes permisos para gestionar inventario, cambiar estados de producción y administrar usuarios.
                </span>
              </div>
            </div>
            <Link
              href="/admin"
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '0.9rem',
                background: '#38bdf8',
                color: '#0f172a',
                fontWeight: 700,
              }}
            >
              ⚙️ Abrir Consola de Administración →
            </Link>
          </div>
        )}

        <div className={styles.dashboardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className={styles.title}>
              {isAdmin ? 'Panel de Control & Encargos' : 'Mis Encargos & Rastreo'}
            </h1>
            <p className={styles.subtitle}>
              Bienvenido, <strong>{currentUser.name}</strong> ({currentUser.email}).
              {isAdmin ? (
                <span style={{ color: '#0284c7', fontWeight: 600, marginLeft: '6px' }}>
                  (Rol: Administrador aImprimir3D 👑)
                </span>
              ) : (
                <span> Aquí puedes ver el estado en tiempo real de tus piezas.</span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isAdmin && (
              <Link href="/admin" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                ⚙️ Consola Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-dark"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* CLIENT SEARCH / TRACKER BAR */}
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por #ID de pedido (ej. AIM-1025)..."
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
                  loadDashboardData();
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
                    <div>
                      <span className={styles.orderId}>Pedido #{ord.id}</span>
                      {ord.trackingNumber && (
                        <div style={{ fontSize: '0.8rem', color: '#0071e3', fontWeight: 600, marginTop: '2px' }}>
                          🚚 Guía de Envío: {ord.trackingNumber}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className={styles.orderItems}>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it, idx) => (
                        <div key={idx}>
                          • {it.quantity}x {it.title} (RD${((it.price || it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()})
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

                  <div className={styles.orderFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', marginRight: '10px' }}>Fecha: {ord.date}</span>
                      <strong style={{ color: '#1d1d1f' }}>
                        Total: RD${(ord.total || 0).toLocaleString()}
                      </strong>
                    </div>

                    {ord.status !== 'completed' && ord.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelClientOrder(ord.id)}
                        className="btn btn-outline-dark"
                        style={{ padding: '4px 12px', fontSize: '0.78rem', color: '#ef4444', borderColor: '#fca5a5' }}
                      >
                        Cancelar Pedido
                      </button>
                    )}
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
                  Modelos en stock: Entrega inmediata (24h). Modelos bajo encargo: 48 a 72 horas.
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
