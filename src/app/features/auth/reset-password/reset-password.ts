import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public token: string | null = null;
  public readonly successMessage = signal<string | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly showPassword = signal<boolean>(false);
  public readonly fieldErrors = signal<Record<string, string>>({});

  public readonly resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  public ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.errorMessage.set('არავალიდური ან არარსებული ლინკი!');
    }
  }

  public onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.errorMessage.set('არავალიდური ან არარსებული ლინკი!');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const newPassword = this.resetForm.value.password as string;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.successMessage.set('პაროლი წარმატებით შეიცვალა! გადაყავხართ ავტორიზაციაზე...');
        this.isLoading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 3000); 
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('პაროლის განახლების ერორი:', err);

        if (err.error?.fieldErrors) {
          this.fieldErrors.set(err.error.fieldErrors);
        } else {
          const serverError = err.error?.message || 'ლინკს ვადა გაუვიდა ან ტოკენი არასწორია.';
          this.errorMessage.set(serverError);
        }
      }
    });
  }
}