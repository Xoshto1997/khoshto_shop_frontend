import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  fieldErrors = signal<Record<string, string>>({});
  public readonly showPassword = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.fieldErrors.set({});
    this.isLoading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        alert('რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ შეხვიდეთ.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('რეგისტრაციის ერორი:', err);

        if (err.error?.fieldErrors) {
          this.fieldErrors.set(err.error.fieldErrors);
        } else if (err.status === 409 || err.status === 403 || err.status === 400) {
          this.errorMessage.set(err.error?.message || 'ეს ელ. ფოსტა უკვე რეგისტრირებულია!');
        } else {
          this.errorMessage.set('რეგისტრაცია ვერ მოხერხდა. სცადეთ მოგვიანებით.');
        }
      }
    });
  }
}