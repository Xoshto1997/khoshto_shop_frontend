import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Order } from '../models/order.model';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import {environment} from '../../environments/environment';

@Service()
export class AdminOrderService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/admin/orders`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { 'Authorization': `Bearer ${token}` }
    };
  }

  public async getAllOrders(): Promise<Order[]> {
    return await firstValueFrom(
      this.http.get<Order[]>(this.apiUrl, this.getHeaders())
    );
  }

  public async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return await firstValueFrom(
      this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, null, {
        ...this.getHeaders(),
        params: { status }
      })
    );
  }
}
