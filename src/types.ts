export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating?: number; // 0-5 scale, optional
}

export interface CartItem {
  id: string;
  quantity: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerDetails: {
      name: string;
      address: string;
      email: string;
  };
  status: OrderStatus;
}

export interface User {
    id: string;
    name: string;
    email: string;
    address?: string;
    role: 'customer' | 'admin';
}
