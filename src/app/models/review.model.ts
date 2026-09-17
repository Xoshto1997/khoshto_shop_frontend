export interface UserInfo {
  id?: number;
  username?: string;
  email?: string;
}

export interface Review {
  id?: number;
  productId: number;
  userName?: string;      
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}