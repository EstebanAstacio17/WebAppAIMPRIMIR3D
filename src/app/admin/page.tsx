'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './admin.module.css';
import { Product, VolumeTier, Order } from '@/types/product';
import { getStoredProducts, saveStoredProducts, updateProductStockDirect, initialMockProducts } from '@/utils/productStorage';
import { getStoredOrders, saveStoredOrders, createNewOrder, updateOrderStatus, initialMockOrders } from '@/utils/orderStorage';
import { getCurrentUser, isUserAdmin, logoutUser } from '@/utils/authRoles';

function AdminContent() {
  const searchParams = useSearchParams();
  const editIdParam = searchParams?.get('editProductId');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Accesorios');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formTiempo, setFormTiempo] = useState('1-2 días');
  const [formImage, setFormImage] = useState('/img/slide1.png');
  const [formStockType, setFormStockType] = useState<'in_stock' | 'on_demand'>('in_stock');
  const [formStockQty, setFormStockQty] = useState<number>(10);
  const [formTiers, setFormTiers] = useState<VolumeTier[]>([]);
  const [formPoliciesText, setFormPoliciesText] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshAdminData = () => {
    // 1. Check if logged in user is admin
    const user = getCurrentUser();
    if (isUserAdmin(user)) {
      setIsAdminLoggedIn(true);
    } else {
      const auth = sessionStorage.getItem('aimprimir3d_admin_auth');
      if (auth === 'true') {
        setIsAdminLoggedIn(true);
      }
    }

    // 2. Load products
    setProducts(getStoredProducts());

    // 3. Load orders
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    refreshAdminData();

    // Event listeners for live synchronization across all components
    const handleOrdersSync = () => setOrders(getStoredOrders());
    const handleProductsSync = () => setProducts(getStoredProducts());

    window.addEventListener('aimprimir3d_orders_updated', handleOrdersSync);
    window.addEventListener('aimprimir3d_products_updated', handleProductsSync);
    window.addEventListener('storage', refreshAdminData);
    window.addEventListener('focus', refreshAdminData);

    // Auto-open edit modal if query param present
    if (editIdParam) {
      const currentProducts = getStoredProducts();
      const found = currentProducts.find((p) => String(p.id) === String(editIdParam));
      if (found) {
        setActiveTab('catalog');
        openEditProductModal(found);
      }
    }

    return () => {
      window.removeEventListener('aimprimir3d_orders_updated', handleOrdersSync);
      window.removeEventListener('aimprimir3d_products_updated', handleProductsSync);
      window.removeEventListener('storage', refreshAdminData);
      window.removeEventListener('focus', refreshAdminData);
    };
  }, [editIdParam]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'aimprimir2026' || adminPassword === 'admin3d' || adminPassword === '1234') {
      sessionStorage.setItem('aimprimir3d_admin_auth', 'true');
      localStorage.setItem('aimprimir3d_staff_session', 'true');
      localStorage.setItem('aimprimir3d_user', JSON.stringify({
        name: 'Staff aImprimir3D',
        email: 'admin@aimprimir3d.com',
        role: 'admin',
        provider: 'staff_gate',
        loggedInAt: new Date().toISOString(),
      }));
      setIsAdminLoggedIn(true);
      setAdminError(null);
      showToast('🔓 Acceso concedido al panel de aImprimir3D');
      window.dispatchEvent(new Event('aimprimir3d_auth_changed'));
    } else {
      setAdminError('Contraseña o PIN incorrecto.');
    }
  };

  const handleAdminLogout = () => {
    logoutUser();
    setIsAdminLoggedIn(false);
    showToast('Sesión de staff cerrada');
    window.location.href = '/';
  };

  const handleCreateTestOrder = () => {
    const randomId = `AIM-${Math.floor(2000 + Math.random() * 8000)}`;
    const testOrder: Order = {
      id: randomId,
      customer: 'Cliente Prueba En Vivo',
      email: 'cliente@prueba.do',
      phone: '809-555-9988',
      address: 'Santo Domingo, Bella Vista',
      notes: 'Pedido de prueba en vivo para verificar stock y logística',
      items: [
        { productId: 2, title: 'Soporte Articulado Gamer para Headset', quantity: 1, unitPrice: 950, price: 950, stockType: 'in_stock' }
      ],
      total: 950,
      status: 'pending',
      date: 'Hoy',
    };
    createNewOrder(testOrder);
    refreshAdminData();
    showToast(`🎉 Pedido #${randomId} creado y stock descontado`);
  };

  const handleResetOrders = () => {
    if (confirm('¿Restablecer pedidos a los valores predeterminados?')) {
      saveStoredOrders(initialMockOrders);
      setOrders(initialMockOrders);
      showToast('🔄 Lista de pedidos restablecida');
    }
  };

  // --- ORDER MANAGEMENT ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Estado de pedido #${orderId} actualizado a "${newStatus}"`);
  };

  const handleSaveTracking = (orderId: string, tracking: string) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    updateOrderStatus(orderId, currentOrder ? currentOrder.status : 'in_production', tracking);
    showToast(`Guía de envío #${tracking} guardada`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, trackingNumber: tracking });
    }
  };

  // --- PRODUCT / CATALOG MANAGEMENT ---
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory('Accesorios');
    setFormDesc('');
    setFormPrice(1000);
    setFormTiempo('1-2 días');
    setFormImage('/img/slide1.png');
    setFormStockType('in_stock');
    setFormStockQty(10);
    setFormTiers([
      { minQty: 1, maxQty: 4, price: 1000 },
      { minQty: 5, maxQty: 19, price: 850 },
      { minQty: 20, maxQty: 999, price: 700 },
    ]);
    setFormPoliciesText(
      'Fabricación bajo demanda en material técnico.\nTiempo de entrega de 2 a 4 días hábiles.\nRequiere abono del 50% para inicio de producción.'
    );
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormCategory(prod.categoria);
    setFormDesc(prod.description);
    setFormPrice(prod.price);
    setFormTiempo(prod.tiempo);
    setFormImage(prod.image);
    setFormStockType(prod.stockType || 'in_stock');
    setFormStockQty(prod.stockQuantity || 0);
    setFormTiers(
      prod.volumePricing && prod.volumePricing.length > 0
        ? [...prod.volumePricing]
        : [{ minQty: 1, maxQty: 999, price: prod.price }]
    );
    setFormPoliciesText(
      prod.onDemandPolicies && prod.onDemandPolicies.length > 0
        ? prod.onDemandPolicies.join('\n')
        : 'Fabricación bajo demanda con garantía de calidad.'
    );
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const policiesArray = formPoliciesText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      title: formTitle.trim(),
      categoria: formCategory,
      description: formDesc.trim(),
      price: Number(formPrice) || 0,
      tiempo: formTiempo.trim(),
      image: formImage || '/img/slide1.png',
      badge: formStockType === 'in_stock' ? 'En Existencia' : 'Bajo Encargo',
      stockType: formStockType,
      stockQuantity: formStockType === 'in_stock' ? Number(formStockQty) || 0 : 0,
      volumePricing: formTiers,
      onDemandPolicies: formStockType === 'on_demand' ? policiesArray : undefined,
      updatedAt: new Date().toISOString(),
    };

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? productPayload : p));
      showToast(`✅ Producto "${formTitle}" actualizado.`);
    } else {
      updatedList = [productPayload, ...products];
      showToast(`🎉 Nuevo producto "${formTitle}" creado con éxito.`);
    }

    setProducts(updatedList);
    saveStoredProducts(updatedList);
    setProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del catálogo?')) {
      const filtered = products.filter((p) => p.id !== productId);
      setProducts(filtered);
      saveStoredProducts(filtered);
      showToast('🗑️ Producto eliminado del catálogo');
    }
  };

  const handleQuickStockChange = (productId: string | number, delta: number) => {
    const target = products.find((p) => String(p.id) === String(productId));
    if (!target) return;
    const currentQty = Number(target.stockQuantity) || 0;
    const newQty = Math.max(0, currentQty + delta);
    const updated = updateProductStockDirect(productId, newQty);
    setProducts(updated);
    showToast(`📦 Stock de "${target.title}" actualizado a ${newQty} u.`);
  };

  const handleQuickStockSet = (productId: string | number, val: string) => {
    const newQty = Math.max(0, parseInt(val, 10) || 0);
    const updated = updateProductStockDirect(productId, newQty);
    setProducts(updated);
  };

  const handleResetCatalog = () => {
    if (confirm('¿Deseas restablecer el catálogo a los productos predeterminados de aImprimir3D?')) {
      saveStoredProducts(initialMockProducts);
      setProducts(initialMockProducts);
      showToast('🔄 Catálogo restablecido');
    }
  };

  const handleAddTier = () => {
    setFormTiers((prev) => [...prev, { minQty: 10, maxQty: 999, price: formPrice * 0.8 }]);
  };

  const handleRemoveTier = (index: number) => {
    setFormTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof VolumeTier, value: number) => {
    setFormTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 1. ADMIN LOGIN GATE (IF NOT LOGGED IN AS STAFF)
  if (!isAdminLoggedIn) {
    return (
      <main
        className="container"
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '44px 36px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '12px', color: '#0f172a' }}>
            Panel de aImprimir3D
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '6px', marginBottom: '24px' }}>
            Acceso exclusivo para el equipo de gestión, logística y catálogo de aImprimir3D.
          </p>

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Ingresa el PIN o contraseña de staff..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                textAlign: 'center',
                outline: 'none',
              }}
              required
              autoFocus
            />

            {adminError && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{adminError}</div>}

            <button type="submit" className="btn btn-primary" style={{ padding: '13px' }}>
              Ingresar al Panel
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ color: '#86868b', fontSize: '0.85rem' }}>
              ← Volver al Sitio Web
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesTab = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.categoria.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const inProductionCount = orders.filter((o) => o.status === 'in_production').length;
  const inStockProductsCount = products.filter((p) => p.stockType === 'in_stock').length;

  return (
    <main className={`container ${styles.adminContainer}`}>
      {/* HEADER */}
      <div className={styles.adminHeader}>
        <div>
          <span style={{ fontSize: '0.82rem', color: '#0071e3', fontWeight: 600, textTransform: 'uppercase' }}>
            Taller & Logística aImprimir3D
          </span>
          <h1 className={styles.title}>Panel de Control & Logística</h1>
          <p className={styles.subtitle}>
            Manejo de pedidos en tiempo real, actualización de existencias de almacén y precios por volumen.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/catalogo" className="btn btn-outline-dark" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
            👁️ Ver Catálogo Web
          </Link>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="btn btn-outline-dark"
            style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className={styles.mainNavTabs}>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`${styles.mainNavTab} ${activeTab === 'orders' ? styles.mainNavTabActive : ''}`}
        >
          📦 Pedidos & Envíos ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`${styles.mainNavTab} ${activeTab === 'catalog' ? styles.mainNavTabActive : ''}`}
        >
          🏷️ Catálogo & Existencias ({products.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ORDERS & LOGISTICS */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div>
          {/* KPI STATS */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Ingresos Registrados</span>
              <span className={styles.statValue}>RD${totalRevenue.toLocaleString()}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Pedidos Activos</span>
              <span className={styles.statValue}>{activeOrdersCount}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>En Fabricación</span>
              <span className={styles.statValue} style={{ color: '#0071e3' }}>
                {inProductionCount}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Modelos en Existencia</span>
              <span className={styles.statValue} style={{ color: '#16a34a' }}>
                {inStockProductsCount}
              </span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className={styles.controlsBar}>
            <div className={styles.filterTabs}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pending', label: '⏳ Pendientes' },
                { id: 'payment_confirmed', label: '💳 Pago Confirmado' },
                { id: 'in_production', label: '🖨️ En Fabricación' },
                { id: 'completed', label: '✅ Entregados' },
                { id: 'cancelled', label: '❌ Cancelados' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id)}
                  className={`${styles.filterTab} ${orderFilter === tab.id ? styles.active : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCreateTestOrder}
                className="btn btn-outline-dark"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                title="Generar un pedido de prueba y comprobar el descuento de stock"
              >
                + Simular Pedido Cliente
              </button>
              <input
                type="text"
                placeholder="Buscar por #ID, cliente o email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID Pedido</th>
                  <th className={styles.th}>Cliente / Contacto</th>
                  <th className={styles.th}>Piezas / Encargo</th>
                  <th className={styles.th}>Total</th>
                  <th className={styles.th}>Guía Envío</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>#{ord.id}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.date}</div>
                    </td>
                    <td className={styles.td}>
                      <strong>{ord.customer}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ord.email}</div>
                      {ord.phone && (
                        <div style={{ fontSize: '0.78rem', color: '#0071e3' }}>{ord.phone}</div>
                      )}
                    </td>
                    <td className={styles.td}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          • {it.quantity}x {it.title}
                        </div>
                      ))}
                    </td>
                    <td className={styles.td}>
                      <strong>RD${(ord.total || 0).toLocaleString()}</strong>
                    </td>
                    <td className={styles.td}>
                      {ord.trackingNumber ? (
                        <span style={{ fontSize: '0.8rem', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', color: '#0369a1' }}>
                          🚚 {ord.trackingNumber}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Sin guía</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                        className={styles.selectStatus}
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="payment_confirmed">💳 Pago Confirmado</option>
                        <option value="in_production">🖨️ En Fabricación</option>
                        <option value="completed">✅ Entregado</option>
                        <option value="cancelled">❌ Cancelado</option>
                      </select>
                    </td>
                    <td className={styles.td}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Detalles & Envío
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No se encontraron pedidos con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CATALOG & INVENTORY MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div>
          <div className={styles.controlsBar}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={openNewProductModal}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              >
                + Agregar Nuevo Producto
              </button>
              <button
                type="button"
                onClick={handleResetCatalog}
                className="btn btn-outline-dark"
                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              >
                🔄 Restaurar Catálogo Base
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar en catálogo..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* CATALOG TABLE */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Imagen</th>
                  <th className={styles.th}>Título / Categoría</th>
                  <th className={styles.th}>Modalidad</th>
                  <th className={styles.th}>Existencia (Stock)</th>
                  <th className={styles.th}>Precio Base (1u)</th>
                  <th className={styles.th}>Precios por Volumen</th>
                  <th className={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td} style={{ width: '60px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                        <Image src={p.image} alt={p.title} fill style={{ objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td className={styles.td}>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#0071e3', fontWeight: 600 }}>
                        {p.categoria} • ⏱️ {p.tiempo}
                      </div>
                    </td>
                    <td className={styles.td}>
                      {p.stockType === 'in_stock' ? (
                        <span className={styles.badgeStock}>🟢 En Existencia</span>
                      ) : (
                        <span className={styles.badgeOnDemand}>⏳ Bajo Encargo</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      {p.stockType === 'in_stock' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleQuickStockChange(p.id, -1)}
                            className="btn btn-outline-dark"
                            style={{ padding: '2px 8px', fontSize: '0.8rem', minWidth: '26px' }}
                            title="Disminuir 1 unidad"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={p.stockQuantity ?? 0}
                            onChange={(e) => handleQuickStockSet(p.id, e.target.value)}
                            style={{
                              width: '52px',
                              textAlign: 'center',
                              padding: '4px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickStockChange(p.id, 1)}
                            className="btn btn-outline-dark"
                            style={{ padding: '2px 8px', fontSize: '0.8rem', minWidth: '26px' }}
                            title="Aumentar 1 unidad"
                          >
                            +
                          </button>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>u.</span>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Fabricación a pedido</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <strong>RD${p.price.toLocaleString()}</strong>
                    </td>
                    <td className={styles.td}>
                      {p.volumePricing && p.volumePricing.length > 0 ? (
                        <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {p.volumePricing.map((t, i) => (
                            <span key={i}>
                              • {t.minQty}{t.maxQty && t.maxQty < 999 ? `-${t.maxQty}` : '+'}u: RD${t.price.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Precio fijo</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          className="btn btn-outline-dark"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="btn btn-outline-dark"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ORDER DETAILS & SHIPPING */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                Detalles del Pedido #{selectedOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Cliente:</strong> {selectedOrder.customer}</div>
              <div><strong>Email:</strong> {selectedOrder.email}</div>
              <div><strong>Teléfono / WhatsApp:</strong> {selectedOrder.phone || 'No especificado'}</div>
              <div><strong>Dirección de Entrega:</strong> {selectedOrder.address || 'Recoger en taller / No indicada'}</div>
              <div><strong>Notas del Cliente:</strong> {selectedOrder.notes || 'Sin notas adicionales'}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Artículos:</h4>
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eef2f6' }}>
                  <span>{it.quantity}x {it.title}</span>
                  <strong>RD${((it.price || it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
                <span>Total:</span>
                <span>RD${(selectedOrder.total || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* TRACKING INPUT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Número de Guía de Envío (Courier / Transporte):</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  defaultValue={selectedOrder.trackingNumber || ''}
                  id="trackingInput"
                  placeholder="Ej. METRO-99182 / VIMENCA-2201"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('trackingInput') as HTMLInputElement;
                    if (input) handleSaveTracking(selectedOrder.id, input.value.trim());
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* WHATSAPP NOTIFICATION */}
            {selectedOrder.phone && (
              <a
                href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola ${selectedOrder.customer}! Te escribimos de aImprimir3D sobre tu pedido #${selectedOrder.id}. Estado actual: ${selectedOrder.status}. ${selectedOrder.trackingNumber ? `Tu número de guía de envío es: ${selectedOrder.trackingNumber}` : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textAlign: 'center', padding: '12px' }}
              >
                💬 Notificar al Cliente por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ========================================================= */}
      {productModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setProductModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {editingProduct ? '✏️ Editar Producto' : '✨ Crear Nuevo Producto'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Título del Producto / Modelo</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. Soporte Mecánico Articulado"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Coleccionables">Coleccionables</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tiempo de Entrega / Fabricación</label>
                  <input
                    type="text"
                    value={formTiempo}
                    onChange={(e) => setFormTiempo(e.target.value)}
                    placeholder="Ej. 1-2 días / Inmediato"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Descripción</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Materiales, uso recomendado, acabado..."
                    className={styles.textarea}
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Ruta o URL de la Imagen</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/img/slide1.png o https://..."
                    className={styles.input}
                    required
                  />
                </div>

                {/* STOCK TYPE SELECTOR */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Modalidad de Venta</label>
                  <select
                    value={formStockType}
                    onChange={(e) => setFormStockType(e.target.value as any)}
                    className={styles.select}
                  >
                    <option value="in_stock">🟢 En Existencia (In Stock)</option>
                    <option value="on_demand">⏳ Bajo Encargo (Fabricación bajo pedido)</option>
                  </select>
                </div>

                {/* STOCK QUANTITY IF IN_STOCK */}
                {formStockType === 'in_stock' ? (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cantidad Disponible en Almacén</label>
                    <input
                      type="number"
                      min="0"
                      value={formStockQty}
                      onChange={(e) => setFormStockQty(Number(e.target.value))}
                      className={styles.input}
                      required
                    />
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Estado de Producción</label>
                    <input
                      type="text"
                      disabled
                      value="Fabricación bajo demanda"
                      className={styles.input}
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                )}

                {/* BASE PRICE */}
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Precio Base Unitario (RD$ para 1 unidad)</label>
                  <input
                    type="number"
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              {/* VOLUME PRICING EDITOR */}
              <div className={styles.volumePricingSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label}>💰 Precios Escalonados por Volumen (Descuento por Cantidad):</label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="btn btn-outline-dark"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    + Agregar Rango
                  </button>
                </div>

                {formTiers.map((tier, idx) => (
                  <div key={idx} className={styles.tierRow}>
                    <div style={{ fontSize: '0.8rem', minWidth: '70px' }}>De (min):</div>
                    <input
                      type="number"
                      min="1"
                      value={tier.minQty}
                      onChange={(e) => handleTierChange(idx, 'minQty', Number(e.target.value))}
                      className={styles.tierInput}
                      placeholder="Min u."
                    />
                    <div style={{ fontSize: '0.8rem', minWidth: '60px' }}>A (max):</div>
                    <input
                      type="number"
                      min="1"
                      value={tier.maxQty || 999}
                      onChange={(e) => handleTierChange(idx, 'maxQty', Number(e.target.value))}
                      className={styles.tierInput}
                      placeholder="Max u."
                    />
                    <div style={{ fontSize: '0.8rem', minWidth: '70px' }}>Precio c/u:</div>
                    <input
                      type="number"
                      min="1"
                      value={tier.price}
                      onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                      className={styles.tierInput}
                      placeholder="Precio RD$"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className={styles.removeTierBtn}
                      title="Eliminar rango"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* ON-DEMAND POLICIES (IF ON_DEMAND) */}
              {formStockType === 'on_demand' && (
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>📜 Políticas y Condiciones de Encargo (1 por línea):</label>
                  <textarea
                    rows={3}
                    value={formPoliciesText}
                    onChange={(e) => setFormPoliciesText(e.target.value)}
                    placeholder="Escribe cada política en una línea separada..."
                    className={styles.textarea}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  💾 Guardar Producto
                </button>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="btn btn-outline-dark"
                  style={{ padding: '12px 18px' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Cargando panel de aImprimir3D...</div>}>
        <AdminContent />
      </Suspense>
      <Footer />
    </>
  );
}
