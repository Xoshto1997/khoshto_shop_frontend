// core/guards/guest-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // თუ უკვე შესულია -> გააგდე მთავარ გვერდზე (ლოგინი არ სჭირდება)
  if (authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  return true; // თუ სტუმარია -> შეუშვი ლოგინზე/რეგისტრაციაზე
};