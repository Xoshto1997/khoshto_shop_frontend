import { Component, inject, input, DestroyRef } from '@angular/core';
import {ProductService } from '../../../core/services/product';

import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product.model';
import { CurrencyService } from '../../../core/services/currency-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart-service';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  public readonly product = input.required<Product>();
  public readonly productService = inject(ProductService);
  public readonly currencyService = inject(CurrencyService);
  public readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  public addToCart(): void {
    const currentProduct = this.product();

    if (currentProduct && currentProduct.id !== undefined) {
      this.cartService
        .addToCart(currentProduct.id, 1)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (): void => {
            this.toastService.show('პროდუქტი წარმატებით დაემატა კალათაში!', 'success');
          },
          error: (err): void => {
            console.error('კალათაში დამატება ჩავარდა:', err);
            this.toastService.show('გთხოვთ ჯერ გაიაროთ ავტორიზაცია!', 'danger');
          },
        });
    } else {
      this.toastService.show('პროდუქტის იდენტიფიკატორი არასწორია.', 'danger');
    }
  }

  public deleteProduct(): void {
    const productId = this.product().id;

    if (this.authService.isAdmin() && productId !== undefined && window.confirm('ნამდვილად გსურთ პროდუქტის წაშლა?')) {
      this.productService.deleteProduct(productId);
    }
  }
}
    