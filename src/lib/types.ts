export interface SignupInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
  storeName: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock?: number;
}

export interface OrderInput {
  customerName: string;
  items: number;
  total: number;
  status?: string;
  payment?: string;
}

export interface StoreInput {
  storeName?: string;
  description?: string;
  website?: string;
  category?: string;
  taxId?: string;
  currency?: string;
  timezone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  emailNotifs?: boolean;
  orderAlerts?: boolean;
  lowStockAlerts?: boolean;
  weeklyReports?: boolean;
}

export interface TeamMemberInput {
  name: string;
  email: string;
  role?: string;
}
