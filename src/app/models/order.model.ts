
export interface OrderItem {
  id?: number;
  name?: string; 
  productName?: string;
  quantity: number;
  price: number;
  product?: {
    id: number;
    productName: string;
    price: number;
  };
}
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'PAID';

export interface OrderItemRequest {
  productId?: number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userEmail: string;
  customerName?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  companyName?: string;  
  taxId?: string;         
  companyAddress?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  stripeSessionId?: string;
  orderItems?: OrderItem[];
}

export interface AdminOrderResponse extends Omit<Order, 'customerName' | 'phoneNumber' | 'city' | 'address' | 'notes' | 'paymentMethod' | 'paymentStatus'> {
  customerName?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}

export interface DirectOrderRequest {
  userEmail: string;
  customerName: string;
  phoneNumber: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
}


export interface ManualOrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface ManualOrderData {
  userEmail: string;
  companyName?: string;    
  taxId?: string;          
  companyAddress?: string;
  items: ManualOrderItem[];
}

export interface CreateManualOrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateManualOrderRequest {
  userEmail: string;
  paymentMethod?: string;
  items: CreateManualOrderItem[];
}