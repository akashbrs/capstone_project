export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'NEEDS_CLEANING';
export type OrderStatus = 'OPEN' | 'IN_KITCHEN' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

export interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isVeg: boolean;
  categoryId: number;
  categoryName: string;
}

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
}

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  table?: RestaurantTable;
  orderType: OrderType;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  createdBy?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface AuthUser {
  username: string;
  fullName: string;
  role: string;
}

export interface DashboardSummary {
  todayOrderCount: number;
  todayRevenue: number;
  paidOrderCount: number;
  activeOrderCount: number;
}
