import { TestBed } from '@angular/core/testing';

import { CartService } from './cart-service';
import { Cart } from '../../models/cart.model';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('counts product rows separately from total quantity', () => {
    service.cart.set({
      id: 1,
      items: [
        { id: 1, product: {} as Cart['items'][number]['product'], quantity: 3 },
        { id: 2, product: {} as Cart['items'][number]['product'], quantity: 1 },
      ],
    });

    expect(service.cartItemsCount()).toBe(2);
    expect(service.cartTotalQuantity()).toBe(4);
  });
});
