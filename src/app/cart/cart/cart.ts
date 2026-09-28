import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CartService } from '../../core/services/cart-service';
import { CurrencyService } from '../../core/services/currency-service';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order-service';
import { OrderItemRequest } from '../../models/order.model';
import { CartItem } from '../../models/cart.model'; 

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html'
})
export class Cart implements OnInit {
  public readonly cartService = inject(CartService);
  public readonly currencyService = inject(CurrencyService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public isLoading = signal<boolean>(false);
  public selectedPaymentMethod = signal<'BANK_TRANSFER' | 'CASH_ON_DELIVERY'>('BANK_TRANSFER');

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  public increaseQuantity(productId: number, currentQty: number): void {
  this.cartService.updateQuantity(productId, currentQty + 1).subscribe({
    error: (err) => console.error('რაოდენობის გაზრდა ჩავარდა:', err)
  });
}

  public decreaseQuantity(productId: number, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.updateQuantity(productId, currentQty - 1);
    } else {
      this.removeItem(productId);
    }
  }

  public removeItem(productId: number): void {
  this.cartService.removeFromCart(productId).subscribe({
    error: (err) => console.error('წაშლა ჩავარდა:', err)
  });
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

    const validItems = currentCart.items.filter((item: CartItem) => item.product.id !== undefined);

    const orderItems: OrderItemRequest[] = validItems.map((item: CartItem) => ({
      productId: item.product.id!,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.price
    }));

    const checkoutData = {
      userEmail: email,
      paymentMethod: this.selectedPaymentMethod(),
      items: orderItems
    };

    try {
      this.isLoading.set(true);

      const createdOrder = await firstValueFrom<{ id: number }>(
        this.orderService.createDirectOrder(checkoutData)
      );

      this.cartService.clearCart();

      this.router.navigate(['/order-success'], { 
        queryParams: { 
          orderId: createdOrder.id, 
          method: this.selectedPaymentMethod() 
        } 
      });

    } catch (error) {
      console.error('შეკვეთის შექმნა ჩავარდა:', error);
      alert('სისტემური შეცდომა, გთხოვთ სცადოთ მოგვიანებით.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
