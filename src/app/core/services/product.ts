import { inject, signal, Service } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from './toast';
import { Observable } from 'rxjs'; 
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../models/page.model';

@Service()
export class ProductService {
  private http = inject(HttpClient); 
  private apiUrl = `${environment.apiUrl}/products`; 
  private toastService = inject(ToastService);

  public products = signal<Product[]>([]);

  public currentPage = signal<number>(0);
  public totalPages = signal<number>(0);
  public totalElements = signal<number>(0);

  public getAllProducts(page: number = 0, size: number = 10): void {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Product>>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.products.set(data.content); 
        this.currentPage.set(data.number);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
      },
      error: (err: Error) => console.error('Error fetching products:', err.message)
    });
  }

  public getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  public addProductWithImages(
    productData: Partial<Product>, 
    coverFile: File, 
    carouselFiles: File[]
  ): Observable<Product> {
    const formData = new FormData();
    
    formData.append('productName', productData.productName || '');
    formData.append('price', String(productData.price || 0));
    formData.append('description', productData.description || '');
    
    formData.append('coverImage', coverFile); 

    carouselFiles.forEach((file) => {
      formData.append('carouselImages', file);
    });

    return this.http.post<Product>(`${this.apiUrl}/add`, formData);
  }

  public updateProductWithImages(
    id: number,
    productData: Partial<Product>,  
    coverFile: File | null,
    carouselFiles: File[]
  ): Observable<Product> {
    const formData = new FormData();

    formData.append('productName', productData.productName || '');
    formData.append('price', String(productData.price || 0));
    formData.append('description', productData.description || '');

    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    carouselFiles.forEach((file) => {
      formData.append('carouselImages', file);
    });

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  public deleteProduct(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.products.update((oldProducts) => oldProducts.filter(p => p.id !== id));
        this.toastService.show('პროდუქტი წარმატებით წაიშალა!', 'danger');
      },
      error: (err: Error) => console.error('Error while deleting:', err.message)
    });
  }
}