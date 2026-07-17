import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  public readonly successMessage = signal<string | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);

  public readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const emailAddress = this.forgotForm.value.email as string;

      this.authService.forgotPassword(emailAddress).subscribe({
        next: () => {
          this.successMessage.set('აღდგენის ინსტრუქცია გაიგზავნა თქვენს ელ. ფოსტაზე!');
          this.isLoading.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          const serverError = err.error?.message || 'სერვერის შეცდომა, გთხოვთ სცადოთ მოგვიანებით.';
          this.errorMessage.set(`${serverError}`);
          this.isLoading.set(false);
        }
      });
    }
  }
}