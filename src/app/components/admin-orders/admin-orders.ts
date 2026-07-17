import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrderService } from '../../services/admin-order-service';
import { Order } from '../../models/order.model';
import { CurrencyService } from '../../services/currency-service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule],
  templateUrl: './admin-orders.html'
})
export class AdminOrders implements OnInit {
  private readonly adminOrderService = inject(AdminOrderService);
  public readonly currencyService = inject(CurrencyService);

  public orders = signal<Order[]>([]);
  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAllOrders();
  }

  public async loadAllOrders(): Promise<void> {
    try {
      this.isLoading.set(true);
      const data = await this.adminOrderService.getAllOrders();
      this.orders.set(data);
    } catch (error) {
      console.error('ორდერების წამოღება ჩავარდა:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async onStatusChange(orderId: number, event: Event): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    
    const newStatus = selectElement.value as Order['status']; 

    try {
      await this.adminOrderService.updateOrderStatus(orderId, newStatus);
      
      this.orders.update(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      
      alert('სტატუსი წარმატებით განახლდა!');
    } catch (error) {
      console.error('სტატუსის შეცვლა ჩავარდა:', error);
      alert('შეცდომა სტატუსის შეცვლისას.');
    }
  }
}