import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: ''
  };
  
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    // التحقق من المدخلات
    if (!this.userData.username.trim()) {
      this.errorMessage = "Le nom d'utilisateur est obligatoire";
      return;
    }
    
    if (!this.userData.email.trim()) {
      this.errorMessage = "L'email est obligatoire";
      return;
    }
    
    if (!this.userData.password) {
      this.errorMessage = "Le mot de passe est obligatoire";
      return;
    }
    
    if (this.userData.password.length < 6) {
      this.errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
      return;
    }
    
    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Sending registration data:', this.userData);

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration response:', response);
        
        if (response.success) {
          this.router.navigate(['/tasks']);
        } else {
          this.errorMessage = response.message || "Échec de l'inscription";
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error details:', error);
        
        if (error.status === 0) {
          this.errorMessage = "Impossible de se connecter au serveur. Vérifiez que le serveur backend est en cours d'exécution.";
        } else if (error.status === 400) {
          this.errorMessage = "Données invalides. Vérifiez vos informations.";
        } else if (error.status === 409) {
          this.errorMessage = "Ce nom d'utilisateur ou email est déjà utilisé.";
        } else {
          this.errorMessage = `Erreur d'inscription (${error.status}): ${error.message}`;
        }
      },
      complete: () => {
        console.log('Registration complete');
      }
    });
  }
}