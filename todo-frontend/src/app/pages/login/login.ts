// src/app/pages/login/login.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';
import { LoginRequest } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    username: '',
    password: ''  // ← إزالة email لأن Spring Boot يتوقع username/password فقط
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;
  serverAvailable: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // التحقق من اتصال الخادم
    this.checkServer();
    
    // إذا كان المستخدم مسجلاً بالفعل، توجيه إلى المهام
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tasks']);
    }
  }

  checkServer() {
    this.authService.checkServerConnection().subscribe({
      next: (available) => {
        this.serverAvailable = available;
        if (!available) {
          this.errorMessage = '⚠️ Serveur non disponible. Vérifiez que Spring Boot est démarré sur http://localhost:8080';
        }
      },
      error: () => {
        this.serverAvailable = false;
        this.errorMessage = '⚠️ Serveur non disponible. Vérifiez que Spring Boot est démarré sur http://localhost:8080';
      }
    });
  }

  login() {
    // التحقق من اتصال الخادم أولاً
    if (!this.serverAvailable) {
      this.errorMessage = 'Serveur non disponible. Vérifiez que Spring Boot est démarré.';
      return;
    }
    
    // التحقق من المدخلات
    if (!this.credentials.username?.trim()) {
      this.errorMessage = "Le nom d'utilisateur est obligatoire";
      return;
    }
    
    if (!this.credentials.password?.trim()) {
      this.errorMessage = "Le mot de passe est obligatoire";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Login attempt with:', this.credentials);

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login response:', response);
        
        if (response.success) {
          console.log('Login successful, navigating to tasks');
          this.router.navigate(['/tasks']);
        } else {
          this.errorMessage = response.message || "Échec de la connexion";
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        this.errorMessage = error.message || "Erreur de connexion. Veuillez réessayer.";
        
        // إذا كان الخطأ بسبب عدم توفر الخادم
        if (error.message.includes('Serveur non disponible')) {
          this.serverAvailable = false;
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}