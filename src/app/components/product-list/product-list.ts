import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { ProductCard } from '../product-card/product-card';
@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  
  public readonly products = this.productService.products;

  ngOnInit() {
    this.productService.getAllProducts();
  }
}