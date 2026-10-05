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
import { ToastService } from '../../../core/services/toast';
import { SeoService } from '../../../core/services/seo';
import { filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';

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
  private readonly toastService = inject(ToastService);
  private readonly seoService = inject(SeoService);
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
      this.updateProductSeo(productFromState);
    }
  }

  public ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const currentProduct = this.product();
        if (currentProduct) {
          this.updateProductSeo(currentProduct);
        }
      });

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
          this.updateProductSeo(data);
        },
        error: (err): void => {
          console.error('პროდუქტი ვერ მოიძებნა', err);
          this.isLoadingProduct.set(false);
        },
      });
  }

  private updateProductSeo(product: Product): void {
    const description = product.description.trim();
    this.seoService.update(
      {
        title: `${product.productName} | 3DSTUDIO`,
        description: description
          ? `${description.slice(0, 155)}${description.length > 155 ? '…' : ''}`
          : `იხილეთ ${product.productName} 3D Studio-ს ონლაინ მაღაზიაში.`,
        image: product.coverImage,
      },
      `/product/${product.id}`,
    );
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
      this.toastService.show('პროდუქტის იდენტიფიკატორი არასწორია.', 'danger');
      return;
    }

    if (!commentText) {
      this.toastService.show('გთხოვთ ჩაწეროთ კომენტარი!', 'info');
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
          this.toastService.show('გმადლობთ! თქვენი შეფასება წარმატებით დაემატა.', 'success');
        },
        error: (err) => {
          console.error('შეფასების გაგზავნა ჩავარდა:', err);
          this.isSubmittingReview.set(false);
          this.toastService.show('შეფასების დამატება ვერ მოხერხდა. გთხოვთ დარწმუნდეთ, რომ ავტორიზებული ხართ.', 'danger');
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

  public quickBuy(): void {
    const currentProduct = this.product();

    if (!currentProduct || currentProduct.id === undefined) {
      this.toastService.show('პროდუქტის იდენტიფიკატორი არასწორია.', 'danger');
      return;
    }

    this.toastService.confirm(
      'გსურთ შეკვეთის ტექსტის დაკოპირება და Messenger-ში გადასვლა?',
      () => void this.completeQuickBuy(currentProduct),
    );
  }

  private async completeQuickBuy(currentProduct: Product): Promise<void> {
    const message = [
      'გამარჯობა! მსურს სწრაფი შეკვეთა:',
      `პროდუქტი: ${currentProduct.productName}`,
      `ფასი: ${this.currencyService.formatPrice(currentProduct.price)}`,
      `ბმული: ${window.location.origin}/product/${currentProduct.id}`,
    ].join('\n');

    const messengerWindow = window.open('about:blank', '_blank');
    if (messengerWindow) {
      messengerWindow.opener = null;
      const countdownDocument = messengerWindow.document;
      countdownDocument.title = 'Messenger-ში გადასვლა';
      countdownDocument.body.innerHTML = `
        <main style="min-height:100vh;display:grid;place-items:center;background:#09090b;color:#f4f4f5;font-family:Arial,sans-serif;text-align:center">
          <div>
            <p style="font-size:18px;font-weight:700">Messenger გაიხსნება</p>
            <p style="color:#fbbf24">გთხოვთ დაელოდოთ <span id="countdown">3</span> წამი...</p>
            <p style="max-width:420px;margin:16px auto 0;color:#a1a1aa;line-height:1.6">გთხოვთ დაელოდოთ, თქვენ მიერ მოწონებული პროდუქტის დეტალები დაკოპირებულია და შეგიძლიათ პირდაპირ ჩასვათ მესენჯერში</p>
          </div>
        </main>`;

      let secondsRemaining = 3;
      const countdown = countdownDocument.getElementById('countdown');
      const timer = window.setInterval(() => {
        if (messengerWindow.closed) {
          window.clearInterval(timer);
          return;
        }

        secondsRemaining -= 1;
        if (secondsRemaining <= 0) {
          window.clearInterval(timer);
          messengerWindow.location.replace('https://m.me/61587657993668');
          return;
        }

        if (countdown) {
          countdown.textContent = String(secondsRemaining);
        }
      }, 1000);
    } else {
      this.toastService.show('Messenger-ის ახალი ჩანართი დაიბლოკა. გთხოვთ დაუშვათ pop-up ფანჯრები.', 'danger');
    }

    try {
      await this.copyOrderMessage(message);
      this.toastService.show('შეკვეთის ტექსტი დაკოპირდა. ჩატში ჩასვით გასაგზავნად.', 'success');
    } catch (error) {
      console.error('შეკვეთის ტექსტის დაკოპირება ვერ მოხერხდა:', error);
      this.toastService.show(
        `Messenger გაიხსნა, მაგრამ ტექსტი ვერ დაკოპირდა. მიუთითეთ პროდუქტი: ${currentProduct.productName}`,
        'info',
      );
    }
  }

  private async copyOrderMessage(message: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        return;
      }
    } catch {
      // Fall back for browsers or contexts that deny Clipboard API access.
    }

    const textarea = document.createElement('textarea');
    textarea.value = message;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    let copied = false;
    try {
      textarea.select();
      copied = document.execCommand('copy');
    } finally {
      textarea.remove();
    }

    if (!copied) {
      throw new Error('Clipboard API and fallback copy both failed.');
    }
  }
}