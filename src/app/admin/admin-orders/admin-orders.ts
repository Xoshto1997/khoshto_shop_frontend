import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order-service';
import { DirectOrderRequest, ManualOrderData, Order, OrderStatus } from '../../models/order.model';
import { CurrencyService } from '../../core/services/currency-service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
})
export class AdminOrders implements OnInit {
  private readonly orderService = inject(OrderService);
  public readonly currencyService = inject(CurrencyService);

  public readonly orders = signal<Order[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isModalOpen = signal<boolean>(false);

  // 🔍 Filter & Search Signals
  public readonly searchQuery = signal<string>('');
  public readonly selectedStatus = signal<string>('ALL');

  // 📄 Pagination Signals
  public readonly currentPage = signal<number>(1);
  public readonly pageSize = signal<number>(10);

  public readonly newOrderData = signal<ManualOrderData>({
    userEmail: '',
    companyName: '',
    taxId: '',
    companyAddress: '',
    items: [{ productName: '', quantity: 1, price: 0 }],
  });

  public readonly calculateTotal = computed(() => {
    return this.newOrderData().items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0,
    );
  });

  // 🔎 Filtered Orders Computed Signal
  public readonly filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const allOrders = this.orders();

    return allOrders.filter((order) => {
      // Status Filter
      const matchesStatus = status === 'ALL' || order.status === status;

      // Search Filter (ID, Email, Company, TaxID, Items)
      const matchesSearch =
        !query ||
        order.id.toString().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.companyName?.toLowerCase().includes(query) ||
        order.taxId?.toLowerCase().includes(query) ||
        order.orderItems?.some((item) => {
          const name = item.name || item.productName || item.product?.productName || '';
          return name.toLowerCase().includes(query);
        });

      return matchesStatus && matchesSearch;
    });
  });

  // 📄 Paginated Orders Computed Signal
  public readonly paginatedOrders = computed(() => {
    const filtered = this.filteredOrders();
    const page = this.currentPage();
    const size = this.pageSize();

    const startIndex = (page - 1) * size;
    return filtered.slice(startIndex, startIndex + size);
  });

  // 📊 Pagination Meta Info
  public readonly totalPages = computed(() => {
    const total = this.filteredOrders().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  ngOnInit(): void {
    this.loadAllOrders();
  }

  public loadAllOrders(): void {
    this.isLoading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders.set(data || []);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('შეკვეთების ჩატვირთვა ჩავარდა:', err);
        this.isLoading.set(false);
      },
    });
  }

  // 🔍 Handlers for Search & Filter
  public onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reset to page 1 on filter
  }

  public onStatusFilterChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1); // Reset to page 1 on filter
  }

  // 📄 Pagination Handlers
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  public onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }

  public onStatusChange(orderId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as OrderStatus;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.orders.update((ordersList) =>
          ordersList.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      },
      error: (err: unknown) => {
        console.error('სტატუსის განახლება ჩავარდა:', err);
        alert('სტატუსის შეცვლა ვერ მოხერხდა!');
      },
    });
  }

  public printOrderInvoice(order: Order): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const itemsHtml = order.orderItems
      ? order.orderItems
          .map((item) => {
            const productName = item.productName || item.product?.productName || item.name || '3D პროდუქტი';
            const price = item.price ?? item.product?.price ?? 0;
            const quantity = item.quantity || 1;
            const totalItemPrice = quantity * price;

            return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${price} ₾</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${totalItemPrice} ₾</td>
            </tr>
          `;
          })
          .join('')
      : '';

    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ინვოისი #${order.id} - 3DSTUDIO</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ffb703; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #111; }
          .info { margin-top: 30px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #ddd; }
          .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">3DSTUDIO</div>
          <div>
            <h2>ინვოისი #${order.id}</h2>
            <p>თარიღი: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('ka-GE') : '-'}</p>
          </div>
        </div>
        <div class="info">
          <p><strong>მომხმარებელი:</strong> ${order.userEmail}</p>
          ${order.companyName ? `<p><strong>კომპანია:</strong> ${order.companyName}</p>` : ''}
          ${order.taxId ? `<p><strong>საიდენტიფიკაციო კოდი (ს/კ):</strong> ${order.taxId}</p>` : ''}
          ${order.companyAddress ? `<p><strong>მისამართი:</strong> ${order.companyAddress}</p>` : ''}
          <p><strong>სტატუსი:</strong> ${order.status}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>პროდუქტი</th>
              <th style="text-align: center;">რაოდენობა</th>
              <th style="text-align: right;">ერთ. ფასი</th>
              <th style="text-align: right;">სულ</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total">
          სულ ჯამი: ${order.totalAmount} GEL
        </div>
      </body>
    </html>
  `;

    doc.open();
    doc.write(invoiceHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }

  public openCreateModal(): void {
    this.newOrderData.set({
      userEmail: '',
      companyName: '',
      taxId: '',
      companyAddress: '',
      items: [{ productName: '', quantity: 1, price: 0 }],
    });
    this.isModalOpen.set(true);
  }

  public closeCreateModal(): void {
    this.isModalOpen.set(false);
  }

  public addItemRow(): void {
    this.newOrderData.update((data) => ({
      ...data,
      items: [...data.items, { productName: '', quantity: 1, price: 0 }],
    }));
  }

  public removeItemRow(index: number): void {
    if (this.newOrderData().items.length > 1) {
      this.newOrderData.update((data) => ({
        ...data,
        items: data.items.filter((_, i) => i !== index),
      }));
    }
  }

  public submitManualOrder(): void {
    const currentData = this.newOrderData();

    if (!currentData.userEmail.trim()) {
      alert('გთხოვთ მიუთითოთ მომხმარებლის ელ-ფოსტა ან ტელეფონი!');
      return;
    }

    const payload: DirectOrderRequest = {
      userEmail: currentData.userEmail,
      companyName: currentData.companyName,
      taxId: currentData.taxId,
      companyAddress: currentData.companyAddress,
      paymentMethod: 'CASH_ON_DELIVERY',
      items: currentData.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    this.orderService.createDirectOrder(payload).subscribe({
      next: (createdOrder: Order) => {
        this.closeCreateModal();
        this.loadAllOrders();
        if (createdOrder) {
          this.printOrderInvoice(createdOrder);
        }
      },
      error: (err: unknown) => {
        console.error('ინვოისის შექმნა ჩავარდა:', err);
        alert('ინვოისის შექმნა ვერ მოხერხდა.');
      },
    });
  }
}