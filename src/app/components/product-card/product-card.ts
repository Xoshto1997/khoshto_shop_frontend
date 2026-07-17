import { Component, inject, input } from '@angular/core';
import {ProductService } from '../../services/product';

import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CurrencyService } from '../../services/currency-service';

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
}
    