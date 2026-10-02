import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CartService } from '../../core/services/cart-service';
import { CurrencyService } from '../../core/services/currency-service';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order-service';
import { DirectOrderRequest, OrderItemRequest, PaymentMethod } from '../../models/order.model';
import { CartItem } from '../../models/cart.model'; 
import { ToastService } from '../../core/services/toast';

type CheckoutPaymentOption = PaymentMethod | 'MESSENGER';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cart.html'
})
export class Cart implements OnInit {
  public readonly cartService = inject(CartService);
  public readonly currencyService = inject(CurrencyService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  public isLoading = signal<boolean>(false);
  public readonly checkoutForm = this.formBuilder.nonNullable.group({
    customerName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9][0-9\s()-]{6,18}[0-9]$/)]],
    city: ['', Validators.required],
    address: ['', Validators.required],
    notes: [''],
    paymentMethod: this.formBuilder.nonNullable.control<CheckoutPaymentOption>('BANK_TRANSFER', Validators.required),
    userEmail: [this.authService.currentUserEmail() ?? '', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.cartService.loadCart();
    const email = this.authService.currentUserEmail();
    if (email) {
      this.checkoutForm.controls.userEmail.setValue(email);
    }
  }

  public increaseQuantity(productId: number, currentQty: number): void {
  this.cartService.updateQuantity(productId, currentQty + 1).subscribe({
    error: (err) => console.error('რაოდენობის გაზრდა ჩავარდა:', err)
  });
}

  public decreaseQuantity(productId: number, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.updateQuantity(productId, currentQty - 1).subscribe({
    error: (err) => console.error('რაოდენობის შემცირება ჩავარდა:', err)
    });
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

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formValue = this.checkoutForm.getRawValue();

    if (formValue.paymentMethod === 'MESSENGER') {
      window.open('https://m.me/61587657993668', '_blank', 'noopener,noreferrer');
      return;
    }
    
    if (!email) {
      this.toastService.show('გთხოვთ გაიაროთ ავტორიზაცია ყიდვამდე!', 'danger');
      return;
    }

    const currentCart = this.cartService.cart();

    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      this.toastService.show('კალათა ცარიელია!', 'info');
      return;
    }

    const validItems = currentCart.items.filter((item: CartItem) => item.product.id !== undefined);

    const orderItems: OrderItemRequest[] = validItems.map((item: CartItem) => ({
      productId: item.product.id!,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.price
    }));

    const paymentMethod: PaymentMethod = formValue.paymentMethod === 'CASH_ON_DELIVERY'
      ? 'CASH_ON_DELIVERY'
      : 'BANK_TRANSFER';
    const checkoutData: DirectOrderRequest = {
      ...formValue,
      paymentMethod,
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
          method: formValue.paymentMethod
        } 
      });

    } catch (error) {
      console.error('შეკვეთის შექმნა ჩავარდა:', error);
      this.toastService.show('სისტემური შეცდომა, გთხოვთ სცადოთ მოგვიანებით.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }
}
