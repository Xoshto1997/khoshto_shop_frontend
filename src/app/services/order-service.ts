import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItemRequest {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
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
}