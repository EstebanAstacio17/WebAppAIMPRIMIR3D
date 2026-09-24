'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './admin.module.css';
import { Product, VolumeTier, Order, StaffMember, CustomerUser } from '@/types/product';
import { getStoredProducts, saveStoredProducts, updateProductStockDirect, initialMockProducts, syncProductsFromApi } from '@/utils/productStorage';
import { getStoredOrders, saveStoredOrders, createNewOrder, updateOrderStatus, initialMockOrders, syncOrdersFromApi } from '@/utils/orderStorage';
import { getCurrentUser, isUserAdmin, logoutUser } from '@/utils/authRoles';

function AdminContent() {
  const searchParams = useSearchParams();
  const editIdParam = searchParams?.get('editProductId');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'staff'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  // User Management View Sub-Tab: 'staff' | 'customers'
  const [userTab, setUserTab] = useState<'staff' | 'customers'>('staff');

  // Staff & Access Management State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffSearch, setStaffSearch] = useState<string>('');
  const [staffModalOpen, setStaffModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Staff Form State
  const [formStaffName, setFormStaffName] = useState('');
  const [formStaffEmail, setFormStaffEmail] = useState('');
  const [formStaffRole, setFormStaffRole] = useState<'admin' | 'supervisor' | 'operador'>('operador');
  const [formStaffDept, setFormStaffDept] = useState('Taller de Impresión 3D');
  const [formStaffActive, setFormStaffActive] = useState<boolean>(true);

  // Customers Management State
  const [customersList, setCustomersList] = useState<CustomerUser[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerUser | null>(null);

  // Customer Form State
  const [formCustName, setFormCustName] = useState('');
  const [formCustEmail, setFormCustEmail] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formCustAddress, setFormCustAddress] = useState('');
  const [formCustStatus, setFormCustStatus] = useState<'active' | 'suspended' | 'vip'>('active');
  const [formCustNotes, setFormCustNotes] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshAdminData = async () => {
    // 1. Check if logged in user is admin
    const user = getCurrentUser();
    if (isUserAdmin(user)) {
      setIsAdminLoggedIn(true);
    } else {
      const auth = typeof window !== 'undefined' ? sessionStorage.getItem('aimprimir3d_admin_auth') : null;
      if (auth === 'true') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    }

    // 2. Load cached immediately
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());

    // 3. Sync live from MongoDB Atlas in background
    try {
      const [liveOrders, liveProducts] = await Promise.all([
        syncOrdersFromApi(),
        syncProductsFromApi(),
      ]);
      if (liveOrders && Array.isArray(liveOrders)) {
        setOrders(liveOrders);
      }
      if (liveProducts && Array.isArray(liveProducts)) {
        setProducts(liveProducts);
      }
      fetchStaffMembers();
      fetchCustomers();
    } catch (err) {
      console.warn('Error syncing admin live data:', err);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch('/api/staff-users');
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.warn('Error fetching staff members:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomersList(data.customers);
      }
    } catch (err) {
      console.warn('Error fetching customers:', err);
    }
  };

  const openCreateCustomerModal = () => {
    setEditingCustomer(null);
    setFormCustName('');
    setFormCustEmail('');
    setFormCustPhone('');
    setFormCustAddress('');
    setFormCustStatus('active');
    setFormCustNotes('');
    setCustomerModalOpen(true);
  };

  const openPromoteCustomerToStaff = (cust: CustomerUser) => {
    setEditingStaff(null);
    setFormStaffName(cust.name);
    setFormStaffEmail(cust.email);
    setFormStaffRole('operador');
    setFormStaffDept('Taller de Impresión 3D');
    setFormStaffActive(true);
    setStaffModalOpen(true);
  };

  const openEditCustomerModal = (cust: CustomerUser) => {
    setEditingCustomer(cust);
    setFormCustName(cust.name);
    setFormCustEmail(cust.email);
    setFormCustPhone(cust.phone || '');
    setFormCustAddress(cust.address || '');
    setFormCustStatus(cust.status || 'active');
    setFormCustNotes(cust.notes || '');
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustEmail.trim() || !formCustName.trim()) {
      showToast('⚠️ Por favor completa el nombre y el correo.');
      return;
    }

    try {
      if (editingCustomer) {
        const res = await fetch('/api/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCustomer.id,
            email: formCustEmail.trim().toLowerCase(),
            name: formCustName.trim(),
            phone: formCustPhone.trim(),
            address: formCustAddress.trim(),
            status: formCustStatus,
            notes: formCustNotes.trim(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`✅ Cliente ${formCustName} actualizado`);
          fetchCustomers();
          setCustomerModalOpen(false);
        } else {
          showToast(`❌ ${data.error || 'Error al actualizar'}`);
        }
      } else {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formCustName.trim(),
            email: formCustEmail.trim().toLowerCase(),
            phone: formCustPhone.trim(),
            address: formCustAddress.trim(),
            status: formCustStatus,
            notes: formCustNotes.trim(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🎉 Cliente ${formCustName} registrado exitosamente`);
          fetchCustomers();
          setCustomerModalOpen(false);
        } else {
          showToast(`❌ ${data.error || 'Error al registrar'}`);
        }
      }
    } catch (err) {
      showToast('❌ Error de conexión al guardar cliente');
    }
  };

  const handleToggleCustomerStatus = async (cust: CustomerUser, newStatus: 'active' | 'suspended' | 'vip') => {
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cust.id, email: cust.email, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Estado de ${cust.name} cambiado a: ${newStatus.toUpperCase()}`);
        fetchCustomers();
      }
    } catch (err) {
      showToast('❌ Error al actualizar estado del cliente');
    }
  };

  const handleDeleteCustomer = async (cust: CustomerUser) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el registro del cliente "${cust.name}"?`)) {
      try {
        const res = await fetch(`/api/customers?id=${encodeURIComponent(cust.id)}&email=${encodeURIComponent(cust.email)}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🗑️ Cliente ${cust.name} eliminado`);
          fetchCustomers();
        }
      } catch (err) {
        showToast('❌ Error al eliminar cliente');
      }
    }
  };

  const openCreateStaffModal = () => {
    setEditingStaff(null);
    setFormStaffName('');
    setFormStaffEmail('');
    setFormStaffRole('operador');
    setFormStaffDept('Taller de Impresión 3D');
    setFormStaffActive(true);
    setStaffModalOpen(true);
  };

  const openEditStaffModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormStaffName(staff.name);
    setFormStaffEmail(staff.email);
    setFormStaffRole(staff.role);
    setFormStaffDept(staff.department || 'Taller 3D');
    setFormStaffActive(staff.active);
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffEmail.trim() || !formStaffName.trim()) {
      showToast('⚠️ Por favor completa el nombre y el correo.');
      return;
    }

    try {
      if (editingStaff) {
        const res = await fetch('/api/staff-users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStaff.id,
            email: formStaffEmail.trim().toLowerCase(),
            name: formStaffName.trim(),
            role: formStaffRole,
            department: formStaffDept.trim(),
            active: formStaffActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`✅ Permisos de ${formStaffName} actualizados`);
          fetchStaffMembers();
          setStaffModalOpen(false);
        } else {
          showToast(`❌ ${data.error || 'Error al guardar'}`);
        }
      } else {
        const res = await fetch('/api/staff-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formStaffName.trim(),
            email: formStaffEmail.trim().toLowerCase(),
            role: formStaffRole,
            department: formStaffDept.trim(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🎉 Empleado ${formStaffName} autorizado exitosamente`);
          fetchStaffMembers();
          setStaffModalOpen(false);
        } else {
          showToast(`❌ ${data.error || 'Error al autorizar'}`);
        }
      }
    } catch (err) {
      showToast('❌ Error de conexión al guardar empleado');
    }
  };

  const handleToggleStaffStatus = async (staff: StaffMember) => {
    try {
      const updatedStatus = !staff.active;
      const res = await fetch('/api/staff-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: staff.id, email: staff.email, active: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(updatedStatus ? `🟢 Acceso habilitado para ${staff.name}` : `⛔ Acceso suspendido para ${staff.name}`);
        fetchStaffMembers();
      }
    } catch (err) {
      showToast('❌ Error al actualizar estado del empleado');
    }
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (confirm(`¿Estás seguro de que deseas revocar y eliminar el acceso de "${staff.name}" (${staff.email})?`)) {
      try {
        const res = await fetch(`/api/staff-users?id=${encodeURIComponent(staff.id)}&email=${encodeURIComponent(staff.email)}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🗑️ Acceso revocado para ${staff.name}`);
          fetchStaffMembers();
        }
      } catch (err) {
        showToast('❌ Error al revocar acceso');
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAdminData();
    setIsRefreshing(false);
    showToast('🔄 Datos sincronizados con MongoDB Atlas');
  };

  useEffect(() => {
    refreshAdminData();

    // Live polling every 5 seconds for real-time order and inventory sync
    const pollInterval = setInterval(() => {
      syncOrdersFromApi()
        .then((liveOrders) => {
          if (liveOrders && Array.isArray(liveOrders)) {
            setOrders(liveOrders);
          }
        })
        .catch(() => {});
    }, 5000);

    // Event listeners for live synchronization across all components
    const handleOrdersSync = () => setOrders(getStoredOrders());
    const handleProductsSync = () => setProducts(getStoredProducts());

    window.addEventListener('aimprimir3d_orders_updated', handleOrdersSync);
    window.addEventListener('aimprimir3d_products_updated', handleProductsSync);
    window.addEventListener('aimprimir3d_auth_changed', refreshAdminData);
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
      clearInterval(pollInterval);
      window.removeEventListener('aimprimir3d_orders_updated', handleOrdersSync);
      window.removeEventListener('aimprimir3d_products_updated', handleProductsSync);
      window.removeEventListener('aimprimir3d_auth_changed', refreshAdminData);
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
    window.location.href = '/auth/login';
  };

  const handleCreateTestOrder = async () => {
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
    await createNewOrder(testOrder);
    await refreshAdminData();
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
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    const updated = await syncOrdersFromApi();
    setOrders(updated);
    showToast(`Estado de pedido #${orderId} actualizado a "${newStatus}"`);
  };

  const handleSaveTracking = async (orderId: string, tracking: string) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    await updateOrderStatus(orderId, currentOrder ? currentOrder.status : 'in_production', tracking);
    const updated = await syncOrdersFromApi();
    setOrders(updated);
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
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`${styles.mainNavTab} ${activeTab === 'staff' ? styles.mainNavTabActive : ''}`}
        >
          👥 Personal & Clientes ({staffList.length + customersList.length})
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

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por #ID, cliente o email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="btn btn-outline-dark"
                title="Sincronizar con base de datos en la nube"
                style={{ padding: '8px 14px', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
              >
                {isRefreshing ? '⏳ Sincronizando...' : '🔄 Actualizar'}
              </button>
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
      {/* TAB 3: USER & STAFF MANAGEMENT (PERSONAL & CLIENTES) */}
      {/* ========================================================= */}
      {activeTab === 'staff' && (
        <div>
          {/* USER MANAGEMENT SUB-NAVIGATION */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#e2e8f0', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
            <button
              type="button"
              onClick={() => setUserTab('staff')}
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: userTab === 'staff' ? '#0f172a' : 'transparent',
                color: userTab === 'staff' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease',
                boxShadow: userTab === 'staff' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              🛠️ Personal & Empleados ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => setUserTab('customers')}
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: userTab === 'customers' ? '#0071e3' : 'transparent',
                color: userTab === 'customers' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease',
                boxShadow: userTab === 'customers' ? '0 4px 12px rgba(0,113,227,0.25)' : 'none',
              }}
            >
              👤 Clientes Registrados ({customersList.length})
            </button>
          </div>

          {/* ========================================================= */}
          {/* SUB-VIEW 1: STAFF & EMPLOYEES */}
          {/* ========================================================= */}
          {userTab === 'staff' && (
            <div>
              {/* SECURITY BANNER */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  padding: '24px 28px',
                  borderRadius: '20px',
                  marginBottom: '28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#0071e3', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Seguridad aImprimir3D
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Control de Acceso de Empleados</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                    Autorización de Personal y Operadores
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', maxWidth: '650px', margin: 0 }}>
                    Solo los correos registrados y activos en este listado tienen autorización para solicitar y validar PINs de acceso para operar la plataforma administrativa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateStaffModal}
                  className="btn btn-primary"
                  style={{ padding: '12px 22px', fontSize: '0.92rem', background: '#0071e3', border: 'none', borderRadius: '12px', fontWeight: 600 }}
                >
                  ➕ Autorizar Nuevo Empleado
                </button>
              </div>

              {/* KPI STATS */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Personal Autorizado</span>
                  <span className={styles.statValue}>{staffList.length}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Administradores</span>
                  <span className={styles.statValue} style={{ color: '#0071e3' }}>
                    {staffList.filter((s) => s.role === 'admin').length}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Supervisores / Operadores</span>
                  <span className={styles.statValue} style={{ color: '#16a34a' }}>
                    {staffList.filter((s) => s.role !== 'admin').length}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Accesos Activos</span>
                  <span className={styles.statValue} style={{ color: '#0f172a' }}>
                    {staffList.filter((s) => s.active).length} / {staffList.length}
                  </span>
                </div>
              </div>

              {/* CONTROLS */}
              <div className={styles.controlsBar}>
                <input
                  type="text"
                  placeholder="Buscar empleado por nombre, correo o área..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className={styles.searchInput}
                  style={{ maxWidth: '400px' }}
                />
              </div>

              {/* STAFF TABLE */}
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Empleado / Usuario</th>
                      <th className={styles.th}>Correo Autorizado</th>
                      <th className={styles.th}>Rol Asignado</th>
                      <th className={styles.th}>Área / Departamento</th>
                      <th className={styles.th}>Estado</th>
                      <th className={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          (s.department && s.department.toLowerCase().includes(staffSearch.toLowerCase()))
                      )
                      .map((s) => (
                        <tr key={s.id || s.email} className={styles.tr}>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: s.active ? '#eff6ff' : '#f1f5f9',
                                  color: s.active ? '#0071e3' : '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{s.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  Registrado: {new Date(s.createdAt).toLocaleDateString('es-DO')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.td}>
                            <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.84rem' }}>
                              {s.email}
                            </code>
                          </td>
                          <td className={styles.td}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background:
                                  s.role === 'admin'
                                    ? '#dbeafe'
                                    : s.role === 'supervisor'
                                    ? '#fef3c7'
                                    : '#f1f5f9',
                                color:
                                  s.role === 'admin'
                                    ? '#1d4ed8'
                                    : s.role === 'supervisor'
                                    ? '#b45309'
                                    : '#475569',
                              }}
                            >
                              {s.role === 'admin' ? '👑 Admin' : s.role === 'supervisor' ? '⭐ Supervisor' : '🛠️ Operador'}
                            </span>
                          </td>
                          <td className={styles.td} style={{ fontSize: '0.85rem', color: '#475569' }}>
                            {s.department || 'Taller de Impresión 3D'}
                          </td>
                          <td className={styles.td}>
                            <button
                              type="button"
                              onClick={() => handleToggleStaffStatus(s)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: 'none',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: s.active ? '#dcfce7' : '#fee2e2',
                                color: s.active ? '#15803d' : '#b91c1c',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title={s.active ? 'Clic para suspender acceso' : 'Clic para habilitar acceso'}
                            >
                              {s.active ? '🟢 Activo' : '⛔ Suspendido'}
                            </button>
                          </td>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => openEditStaffModal(s)}
                                className="btn btn-outline-dark"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(s)}
                                className="btn btn-outline-dark"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5' }}
                                title="Revocar acceso"
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
          {/* SUB-VIEW 2: REGISTERED CUSTOMERS (CRM) */}
          {/* ========================================================= */}
          {userTab === 'customers' && (
            <div>
              {/* CUSTOMERS CRM BANNER */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0071e3 0%, #004bb5 100%)',
                  color: '#ffffff',
                  padding: '24px 28px',
                  borderRadius: '20px',
                  marginBottom: '28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(0, 113, 227, 0.2)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#ffffff', color: '#0071e3', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      CRM & Clientes
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#e0f2fe' }}>Directorio de Compradores</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                    Gestión y Control de Clientes
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#f0f9ff', maxWidth: '650px', margin: 0 }}>
                    Control de compradores registrados en la tienda, historial de pedidos, clientes VIP, teléfonos y direcciones de despacho.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateCustomerModal}
                  className="btn"
                  style={{ padding: '12px 22px', fontSize: '0.92rem', background: '#ffffff', color: '#0071e3', border: 'none', borderRadius: '12px', fontWeight: 700 }}
                >
                  ➕ Registrar Nuevo Cliente
                </button>
              </div>

              {/* KPI STATS */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Clientes Registrados</span>
                  <span className={styles.statValue}>{customersList.length}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Clientes VIP / Preferenciales</span>
                  <span className={styles.statValue} style={{ color: '#0071e3' }}>
                    {customersList.filter((c) => c.status === 'vip').length}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Facturación Acumulada</span>
                  <span className={styles.statValue} style={{ color: '#16a34a' }}>
                    RD${customersList.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Pedidos Realizados</span>
                  <span className={styles.statValue} style={{ color: '#0f172a' }}>
                    {customersList.reduce((acc, c) => acc + (Number(c.totalOrders) || 0), 0)}
                  </span>
                </div>
              </div>

              {/* CONTROLS */}
              <div className={styles.controlsBar}>
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre, correo, teléfono o dirección..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className={styles.searchInput}
                  style={{ maxWidth: '440px' }}
                />
              </div>

              {/* CUSTOMERS TABLE */}
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Cliente / Registro</th>
                      <th className={styles.th}>Contacto</th>
                      <th className={styles.th}>Dirección de Entrega</th>
                      <th className={styles.th}>Historial Compras</th>
                      <th className={styles.th}>Categoría</th>
                      <th className={styles.th}>Notas / CRM</th>
                      <th className={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.phone && c.phone.includes(customerSearch)) ||
                          (c.address && c.address.toLowerCase().includes(customerSearch.toLowerCase()))
                      )
                      .map((c) => (
                        <tr key={c.id || c.email} className={styles.tr}>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: c.status === 'vip' ? '#fef3c7' : '#eff6ff',
                                  color: c.status === 'vip' ? '#b45309' : '#0071e3',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.92rem',
                                }}
                              >
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{c.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  Miembro desde: {new Date(c.createdAt).toLocaleDateString('es-DO')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.td}>
                            <div style={{ fontSize: '0.85rem' }}>
                              <div>{c.email}</div>
                              {c.phone && (
                                <a
                                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                                >
                                  💬 {c.phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className={styles.td} style={{ fontSize: '0.84rem', color: '#475569', maxWidth: '180px' }}>
                            {c.address || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin registrar</span>}
                          </td>
                          <td className={styles.td}>
                            <div>
                              <strong style={{ color: '#0071e3' }}>{c.totalOrders || 0} pedidos</strong>
                              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                                Total: RD${(c.totalSpent || 0).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className={styles.td}>
                            <button
                              type="button"
                              onClick={() => handleToggleCustomerStatus(c, c.status === 'vip' ? 'active' : c.status === 'active' ? 'vip' : 'active')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: 'none',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background:
                                  c.status === 'vip'
                                    ? '#fef3c7'
                                    : c.status === 'suspended'
                                    ? '#fee2e2'
                                    : '#dcfce7',
                                color:
                                  c.status === 'vip'
                                    ? '#b45309'
                                    : c.status === 'suspended'
                                    ? '#b91c1c'
                                    : '#15803d',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Clic para alternar categoría"
                            >
                              {c.status === 'vip' ? '⭐ VIP' : c.status === 'suspended' ? '⛔ Bloqueado' : '🟢 Activo'}
                            </button>
                          </td>
                          <td className={styles.td} style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '180px' }}>
                            {c.notes || '-'}
                          </td>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => openPromoteCustomerToStaff(c)}
                                className="btn btn-outline-dark"
                                style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#0071e3', borderColor: '#bfdbfe', background: '#eff6ff' }}
                                title="Promover o asignar permisos de staff / administración a este usuario"
                              >
                                👑 Dar Permisos Staff
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditCustomerModal(c)}
                                className="btn btn-outline-dark"
                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(c)}
                                className="btn btn-outline-dark"
                                style={{ padding: '6px 8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5' }}
                                title="Eliminar cliente"
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

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT STAFF MEMBER */}
      {/* ========================================================= */}
      {staffModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setStaffModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingStaff ? '✏️ Modificar Permisos de Empleado' : '➕ Autorizar Nuevo Empleado'}
              </h3>
              <button
                type="button"
                onClick={() => setStaffModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Nombre Completo del Empleado</label>
                <input
                  type="text"
                  value={formStaffName}
                  onChange={(e) => setFormStaffName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Correo Electrónico Autorizado</label>
                <input
                  type="email"
                  value={formStaffEmail}
                  onChange={(e) => setFormStaffEmail(e.target.value)}
                  placeholder="juan@aimprimir3d.com o juan@gmail.com"
                  className={styles.input}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  El empleado usará este correo para recibir su PIN de 6 dígitos de inicio de sesión.
                </span>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Rol y Nivel de Acceso</label>
                <select
                  value={formStaffRole}
                  onChange={(e) => setFormStaffRole(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="operador">🛠️ Operador (Visualización y Cambio de Estados de Fabricación)</option>
                  <option value="supervisor">⭐ Supervisor (Control de Stock, Pedidos y Despachos)</option>
                  <option value="admin">👑 Administrador (Acceso Total: Catálogo, Pedidos y Gestión de Usuarios)</option>
                </select>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Área o Departamento</label>
                <input
                  type="text"
                  value={formStaffDept}
                  onChange={(e) => setFormStaffDept(e.target.value)}
                  placeholder="Ej. Granja 3D, Logística y Envíos, Soporte"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Estado del Acceso</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="staffActive"
                      checked={formStaffActive}
                      onChange={() => setFormStaffActive(true)}
                    />
                    🟢 <strong>Acceso Activo</strong> (Puede ingresar con verificación PIN)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="staffActive"
                      checked={!formStaffActive}
                      onChange={() => setFormStaffActive(false)}
                    />
                    ⛔ <strong>Suspendido</strong> (Acceso temporalmente revocado)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  💾 {editingStaff ? 'Actualizar Permisos' : 'Autorizar Empleado'}
                </button>
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
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

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CUSTOMER */}
      {/* ========================================================= */}
      {customerModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCustomerModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingCustomer ? '✏️ Editar Información de Cliente' : '➕ Registrar Nuevo Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Nombre Completo / Razón Social</label>
                <input
                  type="text"
                  value={formCustName}
                  onChange={(e) => setFormCustName(e.target.value)}
                  placeholder="Ej. Juan Pérez o Empresa XYZ"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  value={formCustEmail}
                  onChange={(e) => setFormCustEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={formCustPhone}
                  onChange={(e) => setFormCustPhone(e.target.value)}
                  placeholder="809-555-0000"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Dirección de Entrega Predeterminada</label>
                <input
                  type="text"
                  value={formCustAddress}
                  onChange={(e) => setFormCustAddress(e.target.value)}
                  placeholder="Ej. Av. 27 de Febrero, Torre Empresarial..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Categoría / Estado del Cliente</label>
                <select
                  value={formCustStatus}
                  onChange={(e) => setFormCustStatus(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="active">🟢 Activo (Cliente Regular)</option>
                  <option value="vip">⭐ VIP / Preferencial (Descuentos y Atención Prioritaria)</option>
                  <option value="suspended">⛔ Bloqueado / Suspendido</option>
                </select>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Notas Internas / CRM</label>
                <textarea
                  rows={2}
                  value={formCustNotes}
                  onChange={(e) => setFormCustNotes(e.target.value)}
                  placeholder="Preferencias de materiales, historial de pagos, etc..."
                  className={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  💾 {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
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
