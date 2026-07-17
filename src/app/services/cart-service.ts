import { inject, signal, computed, Service } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Service()
export class CartService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cart`;

  public cart = signal<Cart | null>(null);

  public cartItemsCount = computed(() => {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items) return 0;
    return currentCart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  });

  public cartTotalPrice = computed(() => {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items) return 0;
    return currentCart.items.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);
  });

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  public loadCart(): void {
    this.http.get<Cart>(this.API_URL, this.getHeaders()).subscribe({
      next: (data) => this.cart.set(data),
      error: (err: Error) => console.error('კალათის წამოღება ჩავარდა:', err.message)
    });
  }

  public addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.API_URL}/add?productId=${productId}&quantity=${quantity}`, {}, this.getHeaders()).pipe(
      tap(updatedCart => this.cart.set(updatedCart))
    );
  }

  public updateQuantity(productId: number, quantity: number): void {
    this.http.put<Cart>(`${this.API_URL}/update?productId=${productId}&quantity=${quantity}`, {}, this.getHeaders()).subscribe({
      next: (updatedCart) => this.cart.set(updatedCart),
      error: (err: Error) => console.error('რაოდენობის შეცვლა ჩავარდა:', err.message)
    });
  }

  public removeFromCart(productId: number): void {
    this.http.delete<Cart>(`${this.API_URL}/remove/${productId}`, this.getHeaders()).subscribe({
      next: (updatedCart) => this.cart.set(updatedCart),
      error: (err: Error) => console.error('პროდუქტის წაშლა ჩავარდა:', err.message)
    });
  }

  public clearCart(): void {
    this.cart.set(null);
  }
}