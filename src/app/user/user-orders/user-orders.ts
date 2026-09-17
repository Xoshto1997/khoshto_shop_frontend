import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order-service';
import { AuthService } from '../../core/services/auth';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule],
  templateUrl: './user-orders.html',
  styleUrl: './user-orders.css'
})
export class UserOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService); 

  public myOrders = signal<Order[]>([]);
  public isLoading = signal<boolean>(false);

  
    ngOnInit(): void {
    const userEmail = this.authService.currentUserEmail(); 

    if (userEmail) {
      this.fetchUserOrders(userEmail);
    }
  }

  public fetchUserOrders(email: string): void {
    this.isLoading.set(true);
    this.orderService.getOrdersByUserEmail(email).subscribe({
      next: (orders: Order[]) => {
        this.myOrders.set(orders || []);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('შეკვეთების ჩატვირთვა ჩავარდა:', err);
        this.isLoading.set(false);
      }
    });
  }

  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }
}