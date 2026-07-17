import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html'
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  public selectedFile: File | null = null;

  public readonly productForm = this.fb.nonNullable.group({
    productName: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0.1)]],
    description: ['', [Validators.required, Validators.maxLength(200)]]
  });

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  public onSubmit(): void {
    if (this.productForm.valid && this.selectedFile) {
      this.productService.addProductWithImage(
        this.productForm.value, 
        this.selectedFile
      );
      this.toastService.show('პროდუქტი წარმატებით დაემატა!', 'success');
      this.router.navigate(['/']);
    }
  }
}