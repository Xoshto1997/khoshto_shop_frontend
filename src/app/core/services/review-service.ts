import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, CreateReviewRequest } from '../../models/review.model';
import { environment } from '../../../environments/environment';


@Service()
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reviews`; 

  public getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  public addReview(reviewData: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, reviewData);
  }
}