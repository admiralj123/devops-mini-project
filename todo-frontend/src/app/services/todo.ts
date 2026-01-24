import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { AuthService } from './auth/auth';
import { Task, TaskCreateDto, mapToTaskCreateDto } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // الحصول على جميع مهام المستخدم
  getTasks(): Observable<Task[]> {
    const username = this.authService.getUsername();
    return this.http.get<any>(`${this.apiUrl}/tasks/user/${username}`).pipe(
      map(response => {
        console.log('Réponse des tâches:', response);
        if (response.success) {
          const tasks = response.tasks || [];
          return tasks.map((task: any) => this.mapBackendTask(task));
        }
        throw new Error(response.message || 'Échec du chargement des tâches');
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des tâches:', error);
        return throwError(() => new Error('Erreur lors du chargement des tâches: ' + 
          (error.error?.message || error.message || 'Erreur inconnue')));
      })
    );
  }

  // إنشاء مهمة جديدة
  createTask(task: Partial<Task>): Observable<Task> {
    const taskDto: TaskCreateDto = mapToTaskCreateDto(task);
    const username = this.authService.getUsername();
    
    // تنسيق التاريخ إذا كان موجوداً
    let formattedDueDate = null;
    if (taskDto.dueDate) {
      formattedDueDate = this.formatDateForBackend(taskDto.dueDate);
    }
    
    // بناء البيانات كما يتوقعها Spring Boot
    const taskData = {
      title: taskDto.title,
      description: taskDto.description || '',
      category: taskDto.category,
      priority: taskDto.priority,
      dueDate: formattedDueDate,
      status: 'Pending', // الحالة الافتراضية
      user: {
        username: username
      }
    };

    console.log('Création de tâche avec données:', taskData);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/tasks`, taskData, { headers }).pipe(
      map(response => {
        console.log('Réponse de création de tâche:', response);
        if (response.success) {
          return this.mapBackendTask(response.task);
        }
        throw new Error(response.message || 'Échec de la création de la tâche');
      }),
      catchError(error => {
        console.error('Erreur lors de la création de la tâche:', error);
        
        let errorMessage = 'Erreur lors de la création de la tâche';
        if (error.error) {
          if (typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              errorMessage = parsedError.message || errorMessage;
            } catch {
              errorMessage = error.error;
            }
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // تحديث مهمة موجودة
  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    const updateData: any = {};
    
    if (task.title !== undefined) updateData.title = task.title;
    if (task.description !== undefined) updateData.description = task.description;
    if (task.category !== undefined) updateData.category = task.category;
    if (task.priority !== undefined) updateData.priority = task.priority;
    if (task.status !== undefined) updateData.status = task.status;
    
    // تنسيق التاريخ إذا كان موجوداً
    if (task.dueDate !== undefined) {
      updateData.dueDate = task.dueDate ? this.formatDateForBackend(task.dueDate) : null;
    }

    console.log('Mise à jour de la tâche', id, 'avec données:', updateData);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(`${this.apiUrl}/tasks/${id}`, updateData, { headers }).pipe(
      map(response => {
        console.log('Réponse de mise à jour de tâche:', response);
        if (response.success) {
          return this.mapBackendTask(response.task);
        }
        throw new Error(response.message || 'Échec de la mise à jour de la tâche');
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        
        let errorMessage = 'Erreur lors de la mise à jour';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // حذف مهمة
  deleteTask(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/tasks/${id}`).pipe(
      map(response => {
        console.log('Réponse de suppression de tâche:', response);
        if (response.success) {
          return true;
        }
        throw new Error(response.message || 'Échec de la suppression de la tâche');
      }),
      catchError(error => {
        console.error('Erreur lors de la suppression de la tâche:', error);
        
        let errorMessage = 'Erreur lors de la suppression';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // تحويل مهمة من Backend إلى Frontend
  private mapBackendTask(backendTask: any): Task {
    if (!backendTask) {
      throw new Error('Données de tâche invalides');
    }

    return {
      id: backendTask.id,
      title: backendTask.title,
      description: backendTask.description || '',
      category: this.normalizeCategory(backendTask.category),
      priority: this.normalizePriority(backendTask.priority),
      dueDate: backendTask.dueDate ? 
        (typeof backendTask.dueDate === 'string' ? 
          backendTask.dueDate : 
          backendTask.dueDate.toString()) : 
        undefined,
      status: backendTask.status === 'Done' ? 'Done' : 'Pending',
      user: backendTask.user,
      createdAt: backendTask.createdAt ? 
        (typeof backendTask.createdAt === 'string' ? 
          backendTask.createdAt : 
          backendTask.createdAt.toString()) : 
        undefined,
      updatedAt: backendTask.updatedAt ? 
        (typeof backendTask.updatedAt === 'string' ? 
          backendTask.updatedAt : 
          backendTask.updatedAt.toString()) : 
        undefined
    };
  }

  // تنسيق التاريخ للخادم (YYYY-MM-DD)
  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  }

  private normalizeCategory(category: string): Task['category'] {
    const normalized = category?.toLowerCase();
    if (normalized === 'travail' || normalized === 'étude' || normalized === 'personnel') {
      return normalized as Task['category'];
    }
    return 'travail'; // القيمة الافتراضية
  }

  private normalizePriority(priority: string): Task['priority'] {
    const normalized = priority?.toLowerCase();
    if (normalized === 'haute' || normalized === 'moyenne' || normalized === 'faible') {
      return normalized as Task['priority'];
    }
    return 'moyenne'; // القيمة الافتراضية
  }
}