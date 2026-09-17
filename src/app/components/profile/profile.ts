import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class Profile {

  // პაროლის ველები
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // სტატუსის შეტყობინებები
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  constructor(private authService: AuthService) {}

  onChangePassword(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 1. ფრონტენდ ვალიდაციები
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      this.errorMessage.set('გთხოვთ შეავსოთ ყველა ველი!');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage.set('ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო!');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage.set('ახალი პაროლები ერთმანეთს არ ემთხვევა!');
      return;
    }

    this.isSubmitting.set(true);

    // 2. ბექენდზე გაგზავნა
    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('პაროლი წარმატებით შეიცვალა!');
        // ფორმის გასუფთავება
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.error || 'პაროლის შეცვლა ვერ მოხერხდა!';
        this.errorMessage.set(msg);
      }
    });
  }
}