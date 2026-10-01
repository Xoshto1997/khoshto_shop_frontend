import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { ProductCard } from '../product-card/product-card';
@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  public readonly currentPage = this.productService.currentPage;
  public readonly totalPages = this.productService.totalPages;
  
  public readonly products = this.productService.products;

  ngOnInit() {
    this.productService.getAllProducts();
  }

  onPageChange(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.productService.getAllProducts(pageIndex, 10);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }
}