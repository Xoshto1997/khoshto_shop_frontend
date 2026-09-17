export interface Product {
  id?: number;
  productName: string;
  price: number;
  description: string;
  coverImage?: string;           
  carouselImages?: string[];     
  imageData?: string;            
  category?: string;            
}