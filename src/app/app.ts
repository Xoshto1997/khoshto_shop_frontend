import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { CommonModule } from '@angular/common';
import { Footer } from './shared/ui/footer/footer';
import { CartService } from './core/services/cart-service';
import { CurrencyService } from './core/services/currency-service';
import { ToastContainer } from './components/toast-container/toast-container';
import { SeoMetadata, SeoService } from './core/services/seo';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, ToastContainer, CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seoService = inject(SeoService);
  public authService = inject(AuthService);
  public cartService = inject(CartService); 
  public currentUser = this.authService.currentUser;
  public readonly currencyService = inject(CurrencyService);






  ngOnInit() {
    this.updateSeoForCurrentRoute();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateSeoForCurrentRoute());

    if (this.authService.isLoggedIn()) {
      this.cartService.loadCart();
    }
    
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  get isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public logout() {
    this.authService.logout(); 
    this.cartService.clearCart(); 
  }

  private updateSeoForCurrentRoute(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const metadata = route.data['seo'] as SeoMetadata | undefined;
    if (metadata) {
      this.seoService.update(metadata, this.router.url);
    }
  }
}
