import { Service } from '@angular/core';
import {signal, computed } from '@angular/core';
@Service()
export class CurrencyService {
    public readonly currentCurrency = signal<'GEL' | 'USD'>('GEL');
  
  private readonly usdRate = 2.64; 

  public toggleCurrency(): void {
    this.currentCurrency.set(this.currentCurrency() === 'GEL' ? 'USD' : 'GEL');
  }

  public formatPrice(priceInGel: number): string {
    if (this.currentCurrency() === 'USD') {
      const priceInUsd = priceInGel / this.usdRate;
      return `$${priceInUsd.toFixed(2)}`; 
    }
    return `${priceInGel.toFixed(2)} ₾`; 
  }
}
