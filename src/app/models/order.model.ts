
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

export interface OrderItemRequest {
  productId?: number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userEmail: string;
  companyName?: string;  
  taxId?: string;         
  companyAddress?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  stripeSessionId?: string;
  orderItems?: OrderItem[];
}

export interface DirectOrderRequest {
  userEmail: string;
  companyName?: string;   
  taxId?: string;        
  companyAddress?: string;
  paymentMethod: string;
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