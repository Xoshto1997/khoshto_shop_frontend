import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast';

@Component({

  selector: 'app-order-success',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.html'
})
export class OrderSuccess implements OnInit {
  private readonly toastService = inject(ToastService);
  orderId = signal<string | null>(null);
  paymentMethod = signal<string>('BANK_TRANSFER');

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId.set(params['orderId'] || '101');
      if (params['method']) {
        this.paymentMethod.set(params['method']);
      }
    });
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.show('ანგარიშის ნომერი დაკოპირდა!', 'success');
    } catch {
      this.toastService.show('ანგარიშის ნომრის კოპირება ვერ მოხერხდა.', 'danger');
    }
  }
}