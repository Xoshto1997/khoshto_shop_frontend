import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
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
  public readonly showPassword = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage.set(null); 

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          alert('რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ შეხვიდეთ.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('რეგისტრაციის ერორი:', err);
          
          if (err.status === 403 || err.status === 400) {
            this.errorMessage.set('ეს ელ. ფოსტა უკვე რეგისტრირებულია!');
          } else {
            this.errorMessage.set('რეგისტრაცია ვერ მოხერხდა. სცადეთ მოგვიანებით.');
          }
        }
      });
    }
  }
}