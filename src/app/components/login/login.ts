import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart-service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  public readonly errorMessage = signal<string | null>(null);
  public readonly showPassword = signal<boolean>(false);

  public readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set(null); 

      this.authService.login(this.loginForm.value).subscribe({
        next: (): void => {
          this.cartService.loadCart();
          this.router.navigate(['/']);
        },
        error: (err): void => {
          console.error('ლოგინის ერორი:', err);
          
          const serverMessage = err.error?.message || 'სერვერთან კავშირი ვერ დამყარდა. სცადეთ მოგვიანებით.';
          this.errorMessage.set(`${serverMessage}`);
        }
      });
    }
  }
}