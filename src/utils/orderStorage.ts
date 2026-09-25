import { Order } from '@/types/product';
import { deductProductStock, restoreProductStock } from './productStorage';

export const initialMockOrders: Order[] = [
  {
    id: 'AIM-1025',
    customer: 'Juan Pérez',
    email: 'juan@correo.com',
    phone: '849-555-1234',
    address: 'Santo Domingo, Piantini',
    notes: 'Color negro mate preferiblemente',
    items: [{ productId: 2, title: 'Soporte Gamer para Auriculares', quantity: 1, unitPrice: 950, price: 950, stockType: 'in_stock' }],
    total: 950,
    status: 'in_production',
    date: 'Hoy',
    trackingNumber: 'VIMENCA-88912',
  },
  {
    id: 'AIM-1024',
    customer: 'María Gómez',
    email: 'maria@correo.com',
    phone: '829-444-5678',
    address: 'Santiago de los Caballeros',
    notes: 'Impresión en resina gris 8K',
    items: [{ productId: 1, title: 'Dragón Mítico & Mecha 8K', quantity: 1, unitPrice: 1850, price: 1850, stockType: 'on_demand' }],
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
    notes: 'Lote corporativo de 20 unidades con logo',
    items: [{ productId: 6, title: 'Llaveros Corporativos (Pack)', quantity: 20, unitPrice: 750, price: 15000, stockType: 'on_demand' }],
    total: 15000,
    status: 'pending',
    date: '20 Sep',
  },
];

const STORAGE_ORDERS_KEY = 'aimprimir3d_orders';

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error cargando pedidos:', err);
    return [];
  }
}

export async function syncOrdersFromApi(email?: string): Promise<Order[]> {
  if (typeof window === 'undefined') return [];
  try {
    const url = email ? `/api/orders?email=${encodeURIComponent(email)}` : '/api/orders';
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(data.orders));
        window.dispatchEvent(new Event('aimprimir3d_orders_updated'));
        return data.orders;
      }
    }
  } catch (e) {
    console.warn('Error sincronizando pedidos:', e);
  }
  return getStoredOrders();
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('aimprimir3d_orders_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error guardando pedidos:', err);
  }
}

/**
 * Registra un nuevo pedido, deduce el inventario de existencias en almacén y sincroniza con MongoDB Atlas
 */
export async function createNewOrder(order: Order): Promise<boolean> {
  const currentOrders = getStoredOrders();
  const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== order.id)];
  
  // 1. Guardar pedido en caché local
  saveStoredOrders(updatedOrders);

  // 2. Deducir stock de almacén para ítems "en existencia"
  if (order.items && order.items.length > 0) {
    deductProductStock(order.items);
  }

  // 3. Sincronizar con MongoDB Atlas
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      window.dispatchEvent(new Event('aimprimir3d_orders_updated'));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error enviando pedido a API:', err);
    return false;
  }
}

/**
 * Cancela un pedido del cliente y devuelve el stock a inventario
 */
export async function cancelOrderById(orderId: string): Promise<boolean> {
  const currentOrders = getStoredOrders();
  let cancelledOrder: Order | undefined;

  const updated = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      cancelledOrder = ord;
      return {
        ...ord,
        status: 'cancelled' as const,
      };
    }
    return ord;
  });

  if (cancelledOrder) {
    saveStoredOrders(updated);
    // Restaurar el stock en caso de que tuviera artículos en existencia
    if (cancelledOrder.items && cancelledOrder.items.length > 0) {
      restoreProductStock(cancelledOrder.items);
    }

    // Sincronizar con MongoDB Atlas
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'cancelled' }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event('aimprimir3d_orders_updated'));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error cancelando pedido en API:', err);
      return false;
    }
  }
  return false;
}

/**
 * Actualiza el estado o número de guía de un pedido y notifica en vivo a clientes y staff
 */
export async function updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<boolean> {
  const currentOrders = getStoredOrders();
  let previousOrder: Order | undefined;

  const updated = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      previousOrder = ord;
      return {
        ...ord,
        status,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
      };
    }
    return ord;
  });

  saveStoredOrders(updated);

  // Si pasa a cancelado y antes no lo estaba, restaurar stock
  if (status === 'cancelled' && previousOrder && previousOrder.status !== 'cancelled') {
    if (previousOrder.items && previousOrder.items.length > 0) {
      restoreProductStock(previousOrder.items);
    }
  }

  // Sincronizar actualización con MongoDB Atlas
  try {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, trackingNumber }),
    });
    if (res.ok) {
      window.dispatchEvent(new Event('aimprimir3d_orders_updated'));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error actualizando estado en API:', err);
    return false;
  }
}
