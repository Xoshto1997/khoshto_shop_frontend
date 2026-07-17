import { inject, signal, computed, Service } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CartService } from './cart-service';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private cartService = inject(CartService);

  public token = signal<string | null>(localStorage.getItem('token'));
  public isLoggedIn = computed(() => !!this.token());
  public currentUserEmail = signal<string | null>(localStorage.getItem('email'));

  public currentUser = computed(() => {
    const email = this.currentUserEmail();
    if (!email) return null;
    return email.split('@')[0]; 
  });

  public isAdmin = computed(() => {  
    const currentToken = this.token();
    
    if (!currentToken || currentToken === 'null' || currentToken === 'undefined') {
      return false;
    }
    
    try {
      const base64Url = currentToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload) as Record<string, unknown>;
      const rawRole = payload['role'] || payload['roles'] || payload['authorities'] || payload['role_name'];
      
      if (!rawRole) return false;

      const roleString = JSON.stringify(rawRole).toUpperCase();
      return roleString.includes('ADMIN');

    } catch {
      return false;
    }
  });

  public register(authData: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, authData).pipe(
      tap(res => {
        this.handleAuth(res.token);
        if (authData.email) this.loginSuccess(authData.email);
      })
    );
  }

  public login(authData: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, authData).pipe(
      tap(res => {
        this.handleAuth(res.token);
        this.cartService.loadCart();
        if (authData.email) this.loginSuccess(authData.email);
      })
    );
  }

  public forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  public resetPassword(token: string, newPassword: string): Observable<unknown> {
    return this.http.post(`${this.API_URL}/reset-password`, null, {
      params: { token, newPassword }
    });
  }

  public loginSuccess(email: string): void {
    localStorage.setItem('email', email);
    this.currentUserEmail.set(email);
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    this.currentUserEmail.set(null);
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(token: string): void {
    localStorage.setItem('token', token);
    this.token.set(token);
  }
}