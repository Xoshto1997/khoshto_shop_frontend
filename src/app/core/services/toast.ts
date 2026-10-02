import { Service, signal } from '@angular/core';
import { ToastMessage } from '../../models/toast.model';


@Service()
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'danger' | 'info' = 'success') {
    const id = Date.now(); 
    
    this.toasts.update(old => [...old, { id, message, type }]);

    setTimeout(() => {
      this.toasts.update(old => old.filter(t => t.id !== id));
    }, 3000);
  }

  dismiss(id: number): void {
    this.toasts.update((messages) => messages.filter((toast) => toast.id !== id));
  }
}