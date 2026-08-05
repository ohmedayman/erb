export interface Store {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  tax_rate: number;
  business_type: string;
  team_size: string;
  features: string[];
  shipping_enabled: boolean;
  installments_enabled: boolean;
  onboarding_done: boolean;
  created_at: string;
}

export interface RegisteredUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  subscription_status: string;
  store_id: string;
  created_at: string;
}

export interface SubscriptionOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  plan_name: string;
  plan_price: number;
  plan_duration: number;
  payment_method: string;
  payment_details: string;
  transaction_id: string;
  screenshot_url: string;
  status: string;
  admin_note: string;
  approved_at: string;
  expires_at: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  status: string;
  store_id: string;
  image_url: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  balance: number;
  store_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_id: string;
  items: any;
  total: number;
  status: string;
  payment: string;
  notes: string;
  store_id: string;
  date: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_id: string;
  items: any;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  payment_status: string;
  paid_amount: number;
  due_date: string;
  notes: string;
  store_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string;
  receipt_url: string;
  notes: string;
  store_id: string;
  date: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  salary: number;
  hire_date: string;
  status: string;
  store_id: string;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  user_name: string;
  store_id: string;
  created_at: string;
}

export interface AdminStats {
  totalStores: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  pendingOrders: number;
  approvedOrders: number;
  activeUsers: number;
  totalCustomers: number;
  totalInvoices: number;
  totalEmployees: number;
}

export type AdminTab =
  | "overview"
  | "stores"
  | "users"
  | "subscriptions"
  | "plans"
  | "products"
  | "orders"
  | "invoices"
  | "customers"
  | "expenses"
  | "employees"
  | "activity"
  | "settings";
