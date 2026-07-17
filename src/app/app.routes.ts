import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import {ProductFormComponent } from './components/product-form/product-form';
import { Register } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth-guard';
import { ProductDetails } from './components/productdetails/productdetails';
import { Cart } from './components/cart/cart';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { adminGuard } from './guards/admin-guard-guard';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'add-product', component: ProductFormComponent },
  
  // 🔒 ვადებთ დაცვას: დალოგინებული აქ ვეღარ შევა!
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'register', component: Register, canActivate: [authGuard] },
  { path: 'product/:id', component: ProductDetails },
   // დეტალების გვერდი კონკრეტული პროდუქტისთვის
   { path: 'cart', component: Cart },
   { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  {
    path: 'admin/orders',
    loadComponent: () => import('./components/admin-orders/admin-orders').then(m => m.AdminOrders),
    canActivate: [adminGuard] // 🛡️ აი ეს იცავს ამ როუტს!
  },
  { path: '**', redirectTo: '' }
];