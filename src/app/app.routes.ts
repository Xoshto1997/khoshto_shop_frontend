import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard-guard'; 
import { adminGuard } from './core/guards/admin-guard-guard';
import { ProductListComponent } from './features/products/product-list/product-list';

export const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    data: {
      seo: {
        title: '3DSTUDIO | 3D ბეჭდვა, მოდელები და პროდუქტები',
        description: 'აღმოაჩინეთ 3D Studio-ს 3D პროდუქტები და მოდელები. დაათვალიერეთ კატალოგი და დაგვიკავშირდით შეკვეთის შესახებ.',
      },
    },
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((c) => c.LoginComponent),
    canActivate: [guestGuard], 
    data: { seo: { title: 'შესვლა | 3DSTUDIO', description: 'შედით 3D Studio-ს ანგარიშში.', noIndex: true } },
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((c) => c.Register),
    canActivate: [guestGuard], 
    data: { seo: { title: 'რეგისტრაცია | 3DSTUDIO', description: 'შექმენით ანგარიში 3D Studio-ში.', noIndex: true } },
  },

  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
    data: { seo: { title: 'ჩემი პროფილი | 3DSTUDIO', description: 'მართეთ თქვენი 3D Studio პროფილი.', noIndex: true } },
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./user/user-orders/user-orders').then((c) => c.UserOrdersComponent),
    canActivate: [authGuard],
    data: { seo: { title: 'ჩემი შეკვეთები | 3DSTUDIO', description: 'იხილეთ თქვენი შეკვეთები 3D Studio-ში.', noIndex: true } },
  },

  {
    path: 'add-product',
    loadComponent: () => import('./features/products/product-form/product-form').then((c) => c.ProductFormComponent),
    canActivate: [adminGuard],
    data: { seo: { title: 'პროდუქტის დამატება | 3DSTUDIO', description: 'მართეთ 3D Studio-ს პროდუქტები.', noIndex: true } },
  },
  {
    path: 'edit-product/:id',
    loadComponent: () => import('./features/products/product-form/product-form').then((c) => c.ProductFormComponent),
    canActivate: [adminGuard],
    data: { seo: { title: 'პროდუქტის რედაქტირება | 3DSTUDIO', description: 'მართეთ 3D Studio-ს პროდუქტები.', noIndex: true } },
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./admin/admin-orders/admin-orders').then((c) => c.AdminOrders),
    canActivate: [adminGuard],
    data: { seo: { title: 'შეკვეთების მართვა | 3DSTUDIO', description: 'მართეთ 3D Studio-ს შეკვეთები.', noIndex: true } },
  },
  {
    path: 'admin/analytics',
    loadComponent: () => import('./admin/admin-analytics/admin-analytics').then((m) => m.AdminAnalytics),
    canActivate: [adminGuard],
    data: { seo: { title: 'ანალიტიკა | 3DSTUDIO', description: '3D Studio-ს ადმინისტრირების გვერდი.', noIndex: true } },
  },

  {
    path: 'product/:id',
    loadComponent: () => import('./features/products/productdetails/productdetails').then((c) => c.ProductDetails),
    data: { seo: { title: 'პროდუქტი | 3DSTUDIO', description: 'იხილეთ 3D Studio-ს პროდუქტის დეტალები.' } },
  },
  { path: 'cart', loadComponent: () => import('./cart/cart/cart').then((c) => c.Cart), data: { seo: { title: 'კალათა | 3DSTUDIO', description: 'იხილეთ თქვენი კალათა 3D Studio-ში.', noIndex: true } } },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then((c) => c.ForgotPassword), data: { seo: { title: 'პაროლის აღდგენა | 3DSTUDIO', description: 'აღადგინეთ თქვენი 3D Studio ანგარიშის პაროლი.', noIndex: true } } },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then((c) => c.ResetPassword), data: { seo: { title: 'პაროლის შეცვლა | 3DSTUDIO', description: 'შეცვალეთ თქვენი 3D Studio ანგარიშის პაროლი.', noIndex: true } } },
  { path: 'order-success', loadComponent: () => import('./admin/order-success/order-success').then((c) => c.OrderSuccess), data: { seo: { title: 'შეკვეთა დასრულებულია | 3DSTUDIO', description: 'შეკვეთის სტატუსი 3D Studio-ში.', noIndex: true } } },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((c) => c.Contact),
    data: {
      seo: {
        title: 'კონტაქტი | 3DSTUDIO საქართველო',
        description: 'დაუკავშირდით 3D Studio-ს ტელეფონით, ელფოსტით ან Messenger-ით. ნახეთ ჩვენი მდებარეობა რუკაზე.',
      },
    },
  },
  { path: 'faq', loadComponent: () => import('./features/faq/faq').then((c) => c.Faq), data: { seo: { title: 'ხშირად დასმული კითხვები | 3DSTUDIO', description: 'პასუხები 3D Studio-ს პროდუქტების, სწრაფი ყიდვისა და შეკვეთების შესახებ.' } } },
  { path: 'license', loadComponent: () => import('./features/license/license').then((c) => c.License), data: { seo: { title: 'ლიცენზია და გამოყენება | 3DSTUDIO', description: 'გაეცანით 3D Studio-ს პროდუქტების ლიცენზიისა და გამოყენების ზოგად ინფორმაციას.' } } },

  { path: '**', loadComponent: () => import('./features/not-found/not-found').then((c) => c.NotFound), data: { seo: { title: 'გვერდი ვერ მოიძებნა | 3DSTUDIO', description: 'მითითებული გვერდი ვერ მოიძებნა.', noIndex: true } } },
];