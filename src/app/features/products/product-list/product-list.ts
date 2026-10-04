import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
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

  @ViewChild('productsSection') private productsSection!: ElementRef<HTMLElement>;

  public readonly currentPage = this.productService.currentPage;
  public readonly totalPages = this.productService.totalPages;
  
  public readonly products = this.productService.products;

  ngOnInit() {
    this.productService.getAllProducts();
  }

  scrollToProducts(): void {
    this.productsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onPageChange(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.productService.getAllProducts(pageIndex, 10);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }
}