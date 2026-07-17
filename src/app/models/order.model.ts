import { Product } from "./product.model";

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userEmail: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  stripeSessionId?: string;
  orderItems?: OrderItem[];
}