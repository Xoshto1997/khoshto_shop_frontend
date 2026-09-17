import { Component, inject, signal, model, OnInit, WritableSignal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { ReviewService } from '../../../core/services/review-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart-service';
import { Product } from '../../../models/product.model';
import { Review } from '../../../models/review.model';
import { CurrencyService } from '../../../core/services/currency-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './productdetails.html',
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  private readonly cartService = inject(CartService);
  public readonly currencyService = inject(CurrencyService);
  private readonly destroyRef = inject(DestroyRef); 

  public readonly product: WritableSignal<Product | null> = signal<Product | null>(null);
  public readonly isLoadingProduct = signal<boolean>(true);
  public readonly activeModalImage = signal<string | null>(null);

  public readonly reviews = signal<Review[]>([]);
  public readonly isSubmittingReview = signal<boolean>(false);

  public newRating = signal<number>(5);
  public newCommentText = model<string>('');
  public hoverRating = signal<number>(0);

  public readonly starsArray = [1, 2, 3, 4, 5];

  public readonly averageRating = computed(() => {
    const list = this.reviews();
    if (!list || list.length === 0) return 0;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / list.length).toFixed(1));
  });

  public readonly primaryImage = computed(() => {
    const prod = this.product();
    if (!prod) return null;
    if (prod.coverImage) return prod.coverImage;
    if (prod.imageData) return `data:image/jpeg;base64,${prod.imageData}`;
    return null;
  });

  constructor() {
    const currentNav = this.router.getCurrentNavigation();
    const productFromState = currentNav?.extras.state as Product;

    if (productFromState) {
      this.product.set(productFromState);
      this.isLoadingProduct.set(false);
    }
  }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = Number(params.get('id'));
        if (id) {
          if (!this.product() || this.product()?.id !== id) {
            this.loadProduct(id);
          }
          this.loadReviews(id);
        }
      });
  }

  private loadProduct(id: number): void {
    this.isLoadingProduct.set(true);
    this.productService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Product): void => {
          this.product.set(data);
          this.isLoadingProduct.set(false);
        },
        error: (err): void => {
          console.error('პროდუქტი ვერ მოიძებნა', err);
          this.isLoadingProduct.set(false);
        },
      });
  }

  private loadReviews(productId: number): void {
    this.reviewService
      .getProductReviews(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Review[]) => this.reviews.set(data),
        error: (err) => console.error('კომენტარების ჩატვირთვა ჩავარდა:', err),
      });
  }

  public updateCoverImage(imgUrl: string): void {
    this.product.update((p) => (p ? { ...p, coverImage: imgUrl } : null));
  }

  public openImageModal(imageUrl: string | null): void {
    if (imageUrl) {
      this.activeModalImage.set(imageUrl);
    }
  }

  public closeImageModal(): void {
    this.activeModalImage.set(null);
  }

  public setRating(stars: number): void {
    this.newRating.set(stars);
  }

  public submitReview(): void {
    const currentProduct = this.product();
    const commentText = this.newCommentText().trim();

    if (!currentProduct || !currentProduct.id) {
      alert('პროდუქტის იდენტიფიკატორი არასწორია.');
      return;
    }

    if (!commentText) {
      alert('გთხოვთ ჩაწეროთ კომენტარი!');
      return;
    }

    this.isSubmittingReview.set(true);

    this.reviewService
      .addReview({
        productId: currentProduct.id,
        rating: this.newRating(),
        comment: commentText,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadReviews(currentProduct.id!);
          this.newCommentText.set('');
          this.newRating.set(5);
          this.isSubmittingReview.set(false);
          alert('გმადლობთ! თქვენი შეფასება წარმატებით დაემატა.');
        },
        error: (err) => {
          console.error('შეფასების გაგზავნა ჩავარდა:', err);
          this.isSubmittingReview.set(false);
          alert('შეფასების დამატება ვერ მოხერხდა. გთხოვთ დარწმუნდეთ, რომ ავტორიზებული ხართ.');
        },
      });
  }

  public addToCart(): void {
    const currentProduct = this.product();

    if (currentProduct && currentProduct.id !== undefined) {
      this.cartService
        .addToCart(currentProduct.id, 1)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (): void => {
            alert('პროდუქტი წარმატებით დაემატა კალათაში!');
          },
          error: (err): void => {
            console.error('კალათაში დამატება ჩავარდა:', err);
            alert('გთხოვთ ჯერ გაიაროთ ავტორიზაცია!');
          },
        });
    } else {
      alert('პროდუქტის იდენტიფიკატორი არასწორია.');
    }
  }
}