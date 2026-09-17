import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart-service';
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
  public readonly isLoading = signal<boolean>(false);
  public readonly fieldErrors = signal<{ [key: string]: string }>({});

  public readonly isMfaRequired = signal<boolean>(false);
  // ✨ 2FA Setup-ის Signal-ები
  public readonly isSetup = signal<boolean>(false);
  public readonly qrCodeUri = signal<string | null>(null);
  public readonly secretKey = signal<string | null>(null);

  public pendingEmail = signal<string>('');

  public readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public readonly mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

 public onSubmit(): void {
  if (this.loginForm.valid) {
    this.errorMessage.set(null); 
    this.fieldErrors.set({});
    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any): void => { // 💡 dynamically ვამოწმებთ ველებს
        this.isLoading.set(false);
        

        if (res.mfaRequired) {
          this.pendingEmail.set(this.loginForm.value.email);
          this.isMfaRequired.set(true);

          // 1. ვპოულობთ QR კოდს (თუ რომელიმე ველში მოვიდა)
          const rawQr = res.qrCodeUri || res.qrCode || res.qrCodeUrl || res.qrCodeImage;
          
          // 2. ვპოულობთ Secret-ს
          const rawSecret = res.secret || res.secretKey || res.mfaSecret;

          // 3. თუ QR კოდი ან Secret მოვიდა, ან isSetup/setup არის true -> ე.ი. SETUP რეჟიმია!
          const isSetupMode = res.isSetup === true || res.setup === true || !!rawQr || !!rawSecret;
          
          this.isSetup.set(isSetupMode);
          
          // 4. QR კოდის ფორმატირება
          if (rawQr) {
            const formattedQr = rawQr.startsWith('data:image') 
              ? rawQr 
              : `data:image/png;base64,${rawQr}`;
            this.qrCodeUri.set(formattedQr);
          } else {
            this.qrCodeUri.set(null);
          }

          this.secretKey.set(rawSecret || null);

        } else {
          this.cartService.loadCart();
          this.router.navigate(['/']);
        }
      },
      error: (err): void => {
        this.isLoading.set(false);
        console.error('ლოგინის ერორი:', err);
        
        if (err.error?.errors && typeof err.error.errors === 'object') {
          this.fieldErrors.set(err.error.errors);
        } else {
          const serverMessage = err.error?.message || 'სერვერთან კავშირი ვერ დამყარდა. სცადეთ მოგვიანებით.';
          this.errorMessage.set(serverMessage);
        }
      }
    });
  } else {
    this.loginForm.markAllAsTouched();
  }
}

  public onVerify2fa(): void {
    if (this.mfaForm.valid) {
      this.errorMessage.set(null);
      this.fieldErrors.set({});
      this.isLoading.set(true);

      this.authService.verify2fa({
        email: this.pendingEmail(),
        code: this.mfaForm.value.code
      }).subscribe({
        next: (): void => {
          this.isLoading.set(false);
          this.cartService.loadCart();
          this.router.navigate(['/']);
        },
        error: (err): void => {
          this.isLoading.set(false);
          console.error('2FA ერორი:', err);
          
          if (err.error?.errors?.code) {
            this.fieldErrors.set(err.error.errors);
          } else {
            const serverMessage = err.error?.message || 'არასწორი ან ვადაგასული კოდი!';
            this.errorMessage.set(serverMessage);
          }
        }
      });
    } else {
      this.mfaForm.markAllAsTouched();
    }
  }

  public cancel2fa(): void {
    this.isMfaRequired.set(false);
    this.isSetup.set(false);
    this.qrCodeUri.set(null);
    this.secretKey.set(null);
    this.errorMessage.set(null);
    this.fieldErrors.set({});
    this.mfaForm.reset();
  }
}