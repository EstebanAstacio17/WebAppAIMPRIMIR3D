import { Product } from '@/types/product';

export const initialMockProducts: Product[] = [
  {
    id: 1,
    title: "Dragón Mítico & Mecha Escultórico",
    description: "Impresión en resina UV 8K con detalles microscópicos, base de exposición y acabado ultra suave listo para pintar.",
    tiempo: "2-3 días",
    categoria: "Coleccionables",
    price: 1850,
    image: "/img/resin_figures.jpg",
    badge: "Resina 8K Ultra",
    stockType: "on_demand",
    stockQuantity: 0,
    volumePricing: [
      { minQty: 1, maxQty: 2, price: 1850 },
      { minQty: 3, maxQty: 5, price: 1650 },
      { minQty: 6, maxQty: 999, price: 1450 },
    ],
    onDemandPolicies: [
      "Fabricación bajo pedido en resina UV de alta definición (8K).",
      "Tiempo de producción y curado: 48 a 72 horas hábiles.",
      "Requiere abono del 50% para iniciar la impresión del modelo.",
      "Garantía de reimpresión si presenta cualquier defecto o rotura de transporte.",
    ],
  },
  {
    id: 2,
    title: "Soporte Articulado Gamer para Headset & Mando",
    description: "Soporte ergonómico con canal organizador de cables y base antideslizante impreso en PLA+ de alta densidad.",
    tiempo: "Entrega Inmediata",
    categoria: "Accesorios",
    price: 950,
    image: "/img/slide1.png",
    badge: "En Existencia",
    stockType: "in_stock",
    stockQuantity: 12,
    volumePricing: [
      { minQty: 1, maxQty: 4, price: 950 },
      { minQty: 5, maxQty: 9, price: 850 },
      { minQty: 10, maxQty: 999, price: 750 },
    ],
  },
  {
    id: 3,
    title: "Lámpara Litofanía LED con Foto Personalizada",
    description: "Tu fotografía favorita convertida en relieve 3D que cobra vida al encender su base LED cálida integrada.",
    tiempo: "2-4 días",
    categoria: "Hogar",
    price: 1450,
    image: "/img/slide2.png",
    badge: "Personalizable",
    stockType: "on_demand",
    stockQuantity: 0,
    volumePricing: [
      { minQty: 1, maxQty: 2, price: 1450 },
      { minQty: 3, maxQty: 5, price: 1300 },
      { minQty: 6, maxQty: 999, price: 1150 },
    ],
    onDemandPolicies: [
      "El cliente debe enviar una foto en alta resolución para procesar el relieve.",
      "Se envía una vista previa digital antes de iniciar la impresión 3D.",
      "Tiempo de fabricación artesanal: 2 a 4 días hábiles.",
      "Incluye base LED USB de luz cálida con interruptor.",
    ],
  },
  {
    id: 4,
    title: "Repuesto de Engranaje Técnico Alta Carga",
    description: "Engranaje helicoidal/recto fabricado en PETG o Nylon técnico para repuestos de maquinaria, electrodomésticos o robótica.",
    tiempo: "1-2 días",
    categoria: "Industrial",
    price: 650,
    image: "/img/slide3.png",
    badge: "Mecánico",
    stockType: "on_demand",
    stockQuantity: 0,
    volumePricing: [
      { minQty: 1, maxQty: 4, price: 650 },
      { minQty: 5, maxQty: 19, price: 520 },
      { minQty: 20, maxQty: 999, price: 420 },
    ],
    onDemandPolicies: [
      "Fabricación en filamentos técnicos de alto impacto (PETG / ABS / Nylon).",
      "Revisión y ajuste de tolerancia de paso y dientes sin costo adicional.",
      "Descuento especial por lotes y repuestos repetitivos para empresas.",
    ],
  },
  {
    id: 5,
    title: "Prototipo de Carcasa Electrónica con Rosca",
    description: "Caja para proyectos Arduino/ESP32 con orificios de ventilación, puertos y tapas a presión.",
    tiempo: "Entrega Inmediata",
    categoria: "Industrial",
    price: 850,
    image: "/img/showcase_precision.jpg",
    badge: "En Existencia",
    stockType: "in_stock",
    stockQuantity: 6,
    volumePricing: [
      { minQty: 1, maxQty: 4, price: 850 },
      { minQty: 5, maxQty: 999, price: 700 },
    ],
  },
  {
    id: 6,
    title: "Llaveros y Merchandising Corporativo (Pack)",
    description: "Llaveros en relieve con el logo y colores de tu empresa, ideales para eventos y regalos promocionales.",
    tiempo: "3-5 días",
    categoria: "Accesorios",
    price: 1200,
    image: "/img/slide1.png",
    badge: "Por Lotes",
    stockType: "on_demand",
    stockQuantity: 0,
    volumePricing: [
      { minQty: 1, maxQty: 4, price: 1200 },
      { minQty: 5, maxQty: 19, price: 950 },
      { minQty: 20, maxQty: 999, price: 750 },
    ],
    onDemandPolicies: [
      "Producción en serie con personalización de colores de tu marca.",
      "Elaboración de muestra física o render 3D para aprobación previa.",
      "Capacidad de entrega rápida para eventos o ferias.",
    ],
  },
];

const STORAGE_KEY = 'aimprimir3d_products_catalog';

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return initialMockProducts;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockProducts));
      // Iniciar sincronización en segundo plano con MongoDB API
      syncProductsFromApi();
      return initialMockProducts;
    }
    const parsed: Product[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockProducts));
      syncProductsFromApi();
      return initialMockProducts;
    }

    // Normalizar datos para garantizar que existencias y modalidades siempre estén actualizadas
    const normalized = parsed.map((p) => {
      const defaultMatch = initialMockProducts.find((def) => String(def.id) === String(p.id));
      const sType = p.stockType || defaultMatch?.stockType || (p.badge?.includes('Existencia') ? 'in_stock' : 'on_demand');
      const sQty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : (defaultMatch?.stockQuantity ?? (sType === 'in_stock' ? 10 : 0));
      return {
        ...p,
        stockType: sType,
        stockQuantity: sQty,
        badge: sType === 'in_stock' ? (sQty > 0 ? 'En Existencia' : 'Agotado') : (p.badge || 'Bajo Encargo'),
        volumePricing: p.volumePricing && p.volumePricing.length > 0 ? p.volumePricing : defaultMatch?.volumePricing,
        onDemandPolicies: p.onDemandPolicies && p.onDemandPolicies.length > 0 ? p.onDemandPolicies : defaultMatch?.onDemandPolicies,
      };
    });

    return normalized;
  } catch (err) {
    console.error('Error cargando catálogo de productos:', err);
    return initialMockProducts;
  }
}

export async function syncProductsFromApi(): Promise<Product[]> {
  if (typeof window === 'undefined') return initialMockProducts;
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
        window.dispatchEvent(new Event('aimprimir3d_products_updated'));
        return data.products;
      }
    }
  } catch (e) {
    // Graceful fallback to cached products
  }
  return getStoredProducts();
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('aimprimir3d_products_updated'));
    window.dispatchEvent(new Event('storage'));

    // Sincronizar en segundo plano con MongoDB Atlas
    products.forEach((prod) => {
      fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod),
      }).catch(() => {});
    });
  } catch (err) {
    console.error('Error guardando catálogo de productos:', err);
  }
}

/**
 * Ajusta la cantidad de existencia directamente para un producto específico
 */
export function updateProductStockDirect(productId: string | number, newQuantity: number): Product[] {
  const current = getStoredProducts();
  const safeQty = Math.max(0, Math.floor(newQuantity));
  const updated = current.map((p) => {
    if (String(p.id) === String(productId)) {
      return {
        ...p,
        stockQuantity: safeQty,
        badge: safeQty > 0 ? 'En Existencia' : 'Agotado',
      };
    }
    return p;
  });
  saveStoredProducts(updated);

  // Sync specific stock change to backend API
  fetch('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, stockQuantity: safeQty }),
  }).catch(() => {});

  return updated;
}

/**
 * Deduce la existencia en almacén de los productos en stock cuando se realiza un pedido
 */
export function deductProductStock(orderedItems: Array<{ productId?: string | number; id?: string | number; quantity: number }>): void {
  const currentProducts = getStoredProducts();
  let changed = false;

  const updatedProducts = currentProducts.map((prod) => {
    const matched = orderedItems.find(
      (it) => String(it.productId ?? it.id) === String(prod.id)
    );
    if (matched && prod.stockType === 'in_stock') {
      const currentQty = Number(prod.stockQuantity) || 0;
      const orderQty = Number(matched.quantity) || 1;
      const remaining = Math.max(0, currentQty - orderQty);
      changed = true;
      return {
        ...prod,
        stockQuantity: remaining,
        badge: remaining > 0 ? 'En Existencia' : 'Agotado',
      };
    }
    return prod;
  });

  if (changed) {
    saveStoredProducts(updatedProducts);
  }
}

/**
 * Restaura la existencia en almacén cuando un pedido es cancelado
 */
export function restoreProductStock(orderedItems: Array<{ productId?: string | number; id?: string | number; quantity: number }>): void {
  const currentProducts = getStoredProducts();
  let changed = false;

  const updatedProducts = currentProducts.map((prod) => {
    const matched = orderedItems.find(
      (it) => String(it.productId ?? it.id) === String(prod.id)
    );
    if (matched && prod.stockType === 'in_stock') {
      const currentQty = Number(prod.stockQuantity) || 0;
      const orderQty = Number(matched.quantity) || 1;
      const restored = currentQty + orderQty;
      changed = true;
      return {
        ...prod,
        stockQuantity: restored,
        badge: 'En Existencia',
      };
    }
    return prod;
  });

  if (changed) {
    saveStoredProducts(updatedProducts);
  }
}

/**
 * Calcula el precio unitario exacto basado en la cantidad y la tabla de precios por volumen
 */
export function calculateUnitPrice(product: Product, quantity: number): number {
  if (!product.volumePricing || product.volumePricing.length === 0) {
    return product.price;
  }

  const matchingTier = product.volumePricing.find((tier) => {
    const min = tier.minQty || 1;
    const max = tier.maxQty || Infinity;
    return quantity >= min && quantity <= max;
  });

  return matchingTier ? matchingTier.price : product.price;
}
