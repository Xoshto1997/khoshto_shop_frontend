import { inject, Service } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DirectOrderRequest, ManualOrderData, Order, OrderItemRequest, OrderStatus } from '../../models/order.model';



@Service()
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  public async createCheckoutSession(cartItems: OrderItemRequest[], userEmail: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.apiUrl}/create-checkout-session`, cartItems, {
        params: { userEmail }
      })
    );
    
    return response.url;
  }

  public createManualOrder(orderData: ManualOrderData): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/admin/create-manual`, orderData);
  }

  public getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/all`);
  }

  public createDirectOrder(data: DirectOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create-direct`, data);
  }

  public updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<Order> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.put<Order>(
      `${this.apiUrl}/${orderId}/status`,
      null,
      {
        headers,
        params: { status: newStatus }
      }
    );
  }

    public getOrdersByUserEmail(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${email}`);
  }
}