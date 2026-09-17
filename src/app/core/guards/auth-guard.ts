// core/guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // თუ შესულია -> შეუშვი პროფილზე!
  if (authService.isLoggedIn()) {
    return true;
  }

  // თუ შესული არ არის -> გადაიყვანე ლოგინზე
  router.navigate(['/login']);
  return false;
};