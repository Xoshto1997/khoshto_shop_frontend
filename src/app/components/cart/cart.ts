import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CurrencyService } from '../../services/currency-service';
import { AuthService } from '../../services/auth';
import { OrderItemRequest, OrderService } from '../../services/order-service';
import { CartItem } from '../../models/cart.model'; 

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html'
})
export class Cart implements OnInit {
  public readonly cartService = inject(CartService);
  public readonly currencyService = inject(CurrencyService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  public increaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  public decreaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  public removeItem(productId: number): void {
    if (confirm('ნამდვილად გსურთ პროდუქტის კალათიდან წაშლა?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  public async onCheckout(): Promise<void> {
    const email = this.authService.currentUserEmail() as string | null;
    
    if (!email) {
      alert('გთხოვთ გაიაროთ ავტორიზაცია ყიდვამდე!');
      return;
    }

    const currentCart = this.cartService.cart();

    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      alert('კალათა ცარიელია!');
      return;
    }

    const orderItems: OrderItemRequest[] = currentCart.items.map((item: CartItem) => ({
      productId: item.product.id,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.price
    }));

    try {
      this.isLoading.set(true);
      const stripeUrl = await this.orderService.createCheckoutSession(orderItems, email);
      window.location.href = stripeUrl;

    } catch (error) {
      console.error('გადახდის სესიის შექმნა ჩავარდა:', error);
      alert('სისტემური შეცდომა, გთხოვთ სცადოთ მოგვიანებით.');
    } finally {
      this.isLoading.set(false);
    }
  }
}