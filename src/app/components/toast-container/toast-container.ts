import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  public toastService = inject(ToastService);
  public toasts = this.toastService.toasts;
}
