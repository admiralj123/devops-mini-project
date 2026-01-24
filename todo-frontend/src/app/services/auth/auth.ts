// src/app/services/auth/auth.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  Observable, 
  tap, 
  catchError, 
  throwError, 
  map,  // ← إضافة هذا
  of     // ← إضافة هذا
} from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // تسجيل الدخول
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login with:', credentials);
    
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => console.log('Login response:', response)),
      map((response: any) => {
        if (response.success) {
          return {
            success: true,
            message: response.message || 'Connexion réussie',
            user: response.user
          } as AuthResponse;
        } else {
          throw new Error(response.message || 'Échec de la connexion');
        }
      }),
      tap((response: AuthResponse) => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login API error:', error);
        
        let errorMessage = 'Erreur de connexion';
        
        if (error.status === 401 || error.status === 404) {
          errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
        } else if (error.status === 0) {
          errorMessage = 'Serveur non disponible. Vérifiez que Spring Boot est démarré.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // تسجيل مستخدم جديد
  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log('Registering user:', userData);
    
    return this.http.post<any>(`${this.apiUrl}/register`, userData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => console.log('Register response:', response)),
      map((response: any) => {
        if (response.success) {
          return {
            success: true,
            message: response.message || 'Inscription réussie',
            user: response.user
          } as AuthResponse;
        } else {
          throw new Error(response.message || 'Échec de l\'inscription');
        }
      }),
      tap((response: AuthResponse) => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Register API error:', error);
        
        let errorMessage = 'Erreur lors de l\'inscription';
        
        if (error.status === 409) {
          errorMessage = 'Nom d\'utilisateur ou email déjà utilisé';
        } else if (error.status === 0) {
          errorMessage = 'Serveur non disponible';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // تسجيل الخروج
  logout(): void {
    console.log('Logging out...');
    localStorage.removeItem('todo_current_user');
    localStorage.removeItem('todo_auth_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // تعيين المستخدم الحالي
  private setCurrentUser(user: User): void {
    console.log('Setting current user:', user.username);
    
    // إزالة كلمة المرور قبل التخزين
    const { password, ...userWithoutPassword } = user;
    this.currentUser.set(userWithoutPassword as User);
    this.isAuthenticated.set(true);
    
    // تخزين في localStorage
    localStorage.setItem('todo_current_user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('todo_auth_token', Date.now().toString()); // token مؤقت
  }

  // استعادة المستخدم من localStorage
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('todo_current_user');
    const token = localStorage.getItem('todo_auth_token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log('User loaded from storage:', user.username);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearStorage();
      }
    }
  }

  // مسح التخزين المحلي
  private clearStorage(): void {
    localStorage.removeItem('todo_current_user');
    localStorage.removeItem('todo_auth_token');
  }

  // الحصول على المستخدم الحالي
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // التحقق إذا كان المستخدم مسجل الدخول
  isLoggedIn(): boolean {
    return this.isAuthenticated() && !!this.currentUser();
  }

  // الحصول على اسم المستخدم
  getUsername(): string {
    return this.currentUser()?.username || '';
  }

  // الحصول على معرف المستخدم
  getUserId(): number | null {
    return this.currentUser()?.id || null;
  }

  // التحقق من اتصال الخادم
  checkServerConnection(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}