import { Component, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { CommonModule } from '@angular/common';
import { Footer } from './shared/ui/footer/footer';
import { CartService } from './core/services/cart-service';
import { CurrencyService } from './core/services/currency-service';
import { ToastContainer } from './components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, ToastContainer, CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  public authService = inject(AuthService);
  public cartService = inject(CartService); 
  public currentUser = this.authService.currentUser;
  public readonly currencyService = inject(CurrencyService);






  ngOnInit() {
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
}
