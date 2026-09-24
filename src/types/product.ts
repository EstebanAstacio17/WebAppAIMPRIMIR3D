export interface VolumeTier {
  minQty: number;
  maxQty?: number; // Optional upper limit (e.g. 5)
  price: number;   // Unit price at this volume
}

export type StockType = 'in_stock' | 'on_demand';

export interface Product {
  id: string | number;
  title: string;
  description: string;
  categoria: string;
  price: number;              // Base unit price (for qty = 1)
  image: string;
  badge?: string;
  tiempo: string;             // e.g. "1-2 días", "Inmediato"
  stockType: StockType;       // 'in_stock' | 'on_demand'
  stockQuantity: number;      // Quantity currently in warehouse
  volumePricing?: VolumeTier[]; // Tiered volume discount table
  onDemandPolicies?: string[];  // Policies for on-demand manufacturing
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId?: string | number;
  title: string;
  quantity: number;
  unitPrice: number;
  price: number; // total for line
  image?: string;
  stockType?: StockType;
}

export interface Order {
  id: string;
  userId?: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'payment_confirmed' | 'in_production' | 'completed' | 'cancelled';
  date: string;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppUser {
  id?: string;
  google_id?: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operador' | 'client';
  provider?: string;
  picture?: string;
  loggedInAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operador';
  department?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  picture?: string;
  provider?: string;
  totalOrders?: number;
  totalSpent?: number;
  status: 'active' | 'suspended' | 'vip';
  notes?: string;
  createdAt: string;
  lastActive?: string;
}

