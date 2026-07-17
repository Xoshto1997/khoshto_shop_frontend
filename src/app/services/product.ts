import { inject, signal, Service } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast';
import { Observable } from 'rxjs'; 
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Service()
export class ProductService {
  private http = inject(HttpClient); 
  private apiUrl = `${environment.apiUrl}/product`; 
  private toastService = inject(ToastService);

  public products = signal<Product[]>([]);

  public getAllProducts(): void {
    this.http.get<Product[]>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.products.set(data); 
      },
      error: (err: Error) => console.error('Error fetching products:', err.message)
    });
  }

  public addProduct(product: Product): void {
    this.http.post<Product>(`${this.apiUrl}/add`, product).subscribe({
      next: (newProduct) => {
        this.products.update((oldProducts) => [...oldProducts, newProduct]);
      },
      error: (err: Error) => console.error('Error while adding:', err.message)
    });
  }

  public getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  
  public addProductWithImage(productData: Partial<Product>, imageFile: File): void {
    const formData = new FormData();
    
    formData.append('productName', productData.productName || '');
    formData.append('price', String(productData.price || 0));
    formData.append('description', productData.description || '');
    formData.append('image', imageFile); 

    this.http.post<Product>(`${this.apiUrl}/add-with-image`, formData).subscribe({
        next: () => {
          this.getAllProducts(); 
        },
        error: (err: Error) => console.error('ერორი ფაილის ატვირთვისას:', err.message)
    });
  }

  public deleteProduct(id: number): void {
    this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.products.update((oldProducts) => oldProducts.filter(p => p.id !== id));
        this.toastService.show('პროდუქტი წარმატებით წაიშალა!', 'danger');
      },
      error: (err: Error) => console.error('Error while deleting:', err.message)
    });
  }
}