import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { ToastService } from '../../../core/services/toast';

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

  public coverFile: File | null = null;
  public carouselFiles: File[] = [];

  public readonly productForm = this.fb.nonNullable.group({
    productName: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0.1)]],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });

  public onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.coverFile = input.files[0];
    }
  }

  public onCarouselSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedList = Array.from(input.files);
      
      const remainingSlots = 3 - this.carouselFiles.length;
      if (remainingSlots > 0) {
        this.carouselFiles.push(...selectedList.slice(0, remainingSlots));
      } else {
        this.toastService.show('მაქსიმუმ 3 კარუსელის ფოტოს დამატება შეგიძლიათ!', 'danger');
      }
    }
  }

  public removeCarouselFile(index: number): void {
    this.carouselFiles.splice(index, 1);
  }

  public onSubmit(): void {
    if (this.productForm.valid && this.coverFile) {
      this.productService.addProductWithImages(
        this.productForm.value, 
        this.coverFile,
        this.carouselFiles
      ).subscribe({
        next: () => {
          this.toastService.show('პროდუქტი წარმატებით დაემატა!', 'success');
          this.productService.getAllProducts();
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('შეცდომა პროდუქტის დამატებისას', 'danger');
        }
      });
    }
  }
}