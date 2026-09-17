import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard-guard'; // 👈 დააიმპორტე guestGuard
import { adminGuard } from './core/guards/admin-guard-guard';
import { ProductListComponent } from './features/products/product-list/product-list';

export const routes: Routes = [
  { path: '', component: ProductListComponent },

  // 🔓 სტუმრების გვერდები (გამოიყენე guestGuard)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((c) => c.LoginComponent),
    canActivate: [guestGuard], // 👈 შეცვალე guestGuard-ით
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((c) => c.Register),
    canActivate: [guestGuard], // 👈 შეცვალე guestGuard-ით
  },

  // 🔒 იუზერის დაცული გვერდები (გამოიყენე სწორი authGuard)
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard] // 👈 ახლა უკვე ნამდვილი authGuard დაიცავს!
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./user/user-orders/user-orders').then((c) => c.UserOrdersComponent),
    canActivate: [authGuard] // 👈 აქვე დაადე, რომ შეკვეთებიც დაცული იყოს!
  },

  // 🛡️ ადმინის გვერდები (adminGuard)
  {
    path: 'add-product',
    loadComponent: () => import('./features/products/product-form/product-form').then((c) => c.ProductFormComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./admin/admin-orders/admin-orders').then((c) => c.AdminOrders),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/analytics',
    loadComponent: () => import('./admin/admin-analytics/admin-analytics').then((m) => m.AdminAnalytics),
    canActivate: [adminGuard],
  },

  // საჯარო გვერდები
  { path: 'product/:id', loadComponent: () => import('./features/products/productdetails/productdetails').then((c) => c.ProductDetails) },
  { path: 'cart', loadComponent: () => import('./cart/cart/cart').then((c) => c.Cart) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then((c) => c.ForgotPassword) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then((c) => c.ResetPassword) },
  { path: 'order-success', loadComponent: () => import('./admin/order-success/order-success').then((c) => c.OrderSuccess) },

  { path: '**', redirectTo: '' },
];