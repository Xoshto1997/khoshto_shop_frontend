import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({

  selector: 'app-order-success',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.html'
})
export class OrderSuccess implements OnInit {
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

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('ანგარიშის ნომერი დაკოპირდა!');
  }
}