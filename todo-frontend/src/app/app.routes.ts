import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register';
import { TasksComponent } from './pages/tasks/tasks';
import { LoginComponent } from './pages/login/login';
import { authGuard, loginGuard } from './services/auth/auth-guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [loginGuard] // لمنع الوصول إذا كان مسجلاً
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard] // لمنع الوصول إذا كان مسجلاً
  },
  { 
    path: 'tasks', 
    component: TasksComponent,
    canActivate: [authGuard] // حماية - يتطلب تسجيل الدخول
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];