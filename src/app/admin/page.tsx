'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './admin.module.css';

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

const defaultAdminOrders: Order[] = [
  {
    id: 'AIM-1025',
    customer: 'Juan Pérez',
    email: 'juan@correo.com',
    phone: '849-555-1234',
    address: 'Santo Domingo, Piantini',
    notes: 'Color negro mate preferiblemente',
    items: [{ title: 'Soporte Gamer para Auriculares', quantity: 1, price: 950 }],
    total: 950,
    status: 'in_production',
    date: 'Hoy',
  },
  {
    id: 'AIM-1024',
    customer: 'María Gómez',
    email: 'maria@correo.com',
    phone: '829-444-5678',
    address: 'Santiago de los Caballeros',
    notes: 'Impresión en resina gris',
    items: [{ title: 'Dragón Mítico & Mecha 8K', quantity: 1, price: 1850 }],
    total: 1850,
    status: 'payment_confirmed',
    date: 'Ayer',
  },
  {
    id: 'AIM-1023',
    customer: 'Carlos Ramírez',
    email: 'carlos@empresa.do',
    phone: '809-333-9876',
    address: 'Distrito Nacional',
    notes: 'Lote de 10 unidades',
    items: [{ title: 'Llaveros y Merchandising Corporativo', quantity: 10, price: 1200 }],
    total: 12000,
    status: 'pending',
    date: '20 Sep',
  },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>(defaultAdminOrders);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aimprimir3d_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          // Merge unique orders
          const merged = [...parsed];
          defaultAdminOrders.forEach((def) => {
            if (!merged.some((m) => m.id === def.id)) {
              merged.push(def);
            }
          });
          setOrders(merged);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    try {
      localStorage.setItem('aimprimir3d_orders', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(`✅ Estado de pedido #${orderId} actualizado a "${newStatus}"`);
  };

  const handleConfirmPayment = (orderId: string) => {
    handleStatusChange(orderId, 'payment_confirmed');
    showToast(`💳 ¡Pago confirmado para el pedido #${orderId}!`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterTab === 'all' || o.status === filterTab;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className={`container ${styles.adminContainer}`}>
        <div className={styles.adminHeader}>
          <h1 className={styles.title}>Panel de Administración de Encargos</h1>
          <p className={styles.subtitle}>
            Gestiona pedidos, confirma pagos externos y actualiza el estado de producción en tiempo real.
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className={styles.controlsBar}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterTab} ${filterTab === 'all' ? styles.active : ''}`}
              onClick={() => setFilterTab('all')}
            >
              Todos ({orders.length})
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filterTab === 'pending' ? styles.active : ''}`}
              onClick={() => setFilterTab('pending')}
            >
              Pendientes
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filterTab === 'payment_confirmed' ? styles.active : ''}`}
              onClick={() => setFilterTab('payment_confirmed')}
            >
              Pago Confirmado
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filterTab === 'in_production' ? styles.active : ''}`}
              onClick={() => setFilterTab('in_production')}
            >
              En Fabricación
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filterTab === 'completed' ? styles.active : ''}`}
              onClick={() => setFilterTab('completed')}
            >
              Completados
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar cliente o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* TABLE CARD */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ID Pedido</th>
                <th className={styles.th}>Cliente</th>
                <th className={styles.th}>Artículos</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Estatus</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    #{ord.id}
                  </td>
                  <td className={styles.td}>
                    <strong>{ord.customer}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#86868b' }}>{ord.email}</span>
                  </td>
                  <td className={styles.td}>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          {it.quantity}x {it.title}
                        </div>
                      ))
                    ) : (
                      <span>1x Encargo Personalizado</span>
                    )}
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    RD${(ord.total || 0).toLocaleString()}
                  </td>
                  <td className={styles.td}>
                    <select
                      className={styles.selectStatus}
                      value={ord.status}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as Order['status'])
                      }
                    >
                      <option value="pending">⏳ Pendiente Cotización</option>
                      <option value="payment_confirmed">💳 Pago Confirmado</option>
                      <option value="in_production">🖨️ En Fabricación</option>
                      <option value="completed">✅ Completado / Entregado</option>
                    </select>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {ord.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(ord.id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Confirmar Pago
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="btn btn-outline-dark"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#86868b' }}>
              No se encontraron encargos para esta búsqueda o filtro.
            </div>
          )}
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalBox} animate-fade-in`}>
              <h3 style={{ fontSize: '1.4rem', color: '#1d1d1f' }}>
                Detalles del Encargo #{selectedOrder.id}
              </h3>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                <div><strong>Cliente:</strong> {selectedOrder.customer}</div>
                <div><strong>Email:</strong> {selectedOrder.email}</div>
                <div><strong>Teléfono:</strong> {selectedOrder.phone || 'No especificado'}</div>
                <div><strong>Dirección de Envío:</strong> {selectedOrder.address || 'No especificada'}</div>
                <div><strong>Notas / Enlace 3D:</strong> {selectedOrder.notes || 'Ninguna nota'}</div>
                <div><strong>Fecha:</strong> {selectedOrder.date}</div>
                <div><strong>Total:</strong> RD${(selectedOrder.total || 0).toLocaleString()}</div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                <a
                  href={`https://wa.me/${selectedOrder.phone?.replace(/[^0-9]/g, '') || '18494622228'}?text=Hola%20${encodeURIComponent(selectedOrder.customer)},%20te%20escribimos%20de%20aImprimir3D%20sobre%20tu%20pedido%20%23${selectedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  💬 Contactar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-outline-dark"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST FEEDBACK */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              background: '#000000',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: '980px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            {toast}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
