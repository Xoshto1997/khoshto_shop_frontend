import { Component, inject, signal, OnInit, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart-service';
import { Product } from '../../models/product.model';
import { CurrencyService } from '../../services/currency-service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './productdetails.html'
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router); 
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  public readonly currencyService = inject(CurrencyService);

  public readonly product: WritableSignal<Product | null> = signal<Product | null>(null);

  constructor() {
    const currentNav = this.router.getCurrentNavigation();
    const productFromState = currentNav?.extras.state as Product;

    if (productFromState) {
      this.product.set(productFromState);
    }
  }

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data: Product): void => {
          this.product.set(data);
        },
        error: (err): void => console.error("პროდუქტი ვერ მოიძებნა", err)
      });
    }
  }

  public addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.cartService.addToCart(currentProduct.id, 1).subscribe({
        next: (): void => {
          alert('პროდუქტი წარმატებით დაემატა კალათაში!');
        },
        error: (err): void => {
          console.error('კალათაში დამატება ჩავარდა:', err);
          alert('გთხოვთ ჯერ გაიაროთ ავტორიზაცია!');
        }
      });
    }
  }
}