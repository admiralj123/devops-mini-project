// src/app/pages/tasks/tasks.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo';
import { AuthService } from '../../services/auth/auth';
import { 
  Task, 
  CATEGORY_OPTIONS, 
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  CATEGORIES,
  PRIORITIES,
  STATUS,
  isTaskCompleted
} from '../../models/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class TasksComponent implements OnInit {

  tasks = signal<Task[]>([]);
  

  taskForm = signal<Partial<Task>>({
    id: undefined,
    title: '',
    description: '',
    category: CATEGORIES.TRAVAIL,
    priority: PRIORITIES.MOYENNE,
    dueDate: '',
    status: STATUS.PENDING
  });
  
  // الفلاتر
  selectedCategory = signal<string>('all');
  selectedPriority = signal<string>('all');
  selectedStatus = signal<string>('all');
  
  // الحالة
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showTaskForm = signal(false);
  isSubmitting = signal(false);
  
  // الخيارات
  categoryOptions = CATEGORY_OPTIONS;
  priorityOptions = PRIORITY_OPTIONS;
  statusOptions = STATUS_OPTIONS;
  
  // إحصائيات
  stats = computed(() => {
    const tasks = this.tasks();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === STATUS.DONE).length,
      pending: tasks.filter(t => t.status === STATUS.PENDING).length,
      work: tasks.filter(t => t.category === CATEGORIES.TRAVAIL).length,
      study: tasks.filter(t => t.category === CATEGORIES.ETUDE).length,
      personal: tasks.filter(t => t.category === CATEGORIES.PERSONNEL).length
    };
  });
  
  // المهام المصفاة
  filteredTasks = computed(() => {
    let filtered = this.tasks();
    
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(task => task.category === this.selectedCategory());
    }
    
    if (this.selectedPriority() !== 'all') {
      filtered = filtered.filter(task => task.priority === this.selectedPriority());
    }
    
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(task => task.status === this.selectedStatus());
    }
    
    return filtered;
  });
  
  constructor(
    private todoService: TodoService,
    public authService: AuthService
  ) {}
  
  ngOnInit() {
    this.loadTasks();
  }
  
  // تحميل المهام
  loadTasks() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.todoService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
        this.showSuccessMessage(`${tasks.length} tâches chargées`);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage.set('Erreur lors du chargement des tâches: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }
  
  // إنشاء/تحديث مهمة
  saveTask() {
    const form = this.taskForm();
    
    if (!form.title?.trim()) {
      this.errorMessage.set('Le titre est obligatoire');
      return;
    }
    
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    if (form.id) {
      // تحديث مهمة موجودة
      this.todoService.updateTask(form.id, form).subscribe({
        next: (updatedTask) => {
          const updatedTasks = this.tasks().map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          this.tasks.set(updatedTasks);
          this.resetForm();
          this.isSubmitting.set(false);
          this.showSuccessMessage('Tâche mise à jour avec succès');
        },
        error: (error) => {
          this.errorMessage.set('Erreur lors de la mise à jour: ' + error.message);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // إنشاء مهمة جديدة
      this.todoService.createTask(form).subscribe({
        next: (newTask) => {
          this.tasks.set([...this.tasks(), newTask]);
          this.resetForm();
          this.isSubmitting.set(false);
          this.showSuccessMessage('Tâche créée avec succès');
        },
        error: (error) => {
          this.errorMessage.set('Erreur lors de la création: ' + error.message);
          this.isSubmitting.set(false);
        }
      });
    }
  }
  
  // تحرير مهمة
  editTask(task: Task) {
    this.taskForm.set({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    });
    this.showTaskForm.set(true);
    this.errorMessage.set('');
  }
  
  // حذف مهمة
  deleteTask(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.todoService.deleteTask(id).subscribe({
        next: () => {
          this.tasks.set(this.tasks().filter(task => task.id !== id));
          this.showSuccessMessage('Tâche supprimée avec succès');
        },
        error: (error) => {
          this.errorMessage.set('Erreur lors de la suppression: ' + error.message);
        }
      });
    }
  }
  
  // تغيير حالة المهمة
  toggleTaskCompletion(task: Task) {
    const newStatus = task.status === STATUS.DONE ? STATUS.PENDING : STATUS.DONE;
    
    this.todoService.updateTask(task.id!, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        const updatedTasks = this.tasks().map(t => 
          t.id === updatedTask.id ? updatedTask : t
        );
        this.tasks.set(updatedTasks);
        const message = newStatus === STATUS.DONE ? 'Tâche marquée comme terminée' : 'Tâche marquée comme en attente';
        this.showSuccessMessage(message);
      },
      error: (error) => {
        this.errorMessage.set('Erreur lors du changement d\'état: ' + error.message);
      }
    });
  }
  
  // إعادة تعيين النموذج
  resetForm() {
    this.taskForm.set({
      id: undefined,
      title: '',
      description: '',
      category: CATEGORIES.TRAVAIL,
      priority: PRIORITIES.MOYENNE,
      dueDate: '',
      status: STATUS.PENDING
    });
    this.showTaskForm.set(false);
    this.errorMessage.set('');
  }
  
  // تطبيق الفلاتر
  applyFilter(type: 'category' | 'priority' | 'status', value: string) {
    if (type === 'category') {
      this.selectedCategory.set(value);
    } else if (type === 'priority') {
      this.selectedPriority.set(value);
    } else {
      this.selectedStatus.set(value);
    }
  }
  
  // تنسيق التاريخ
  formatDate(dateString?: string): string {
    if (!dateString) return 'Pas de date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }
  
  // الحصول على أيقونة التصنيف
  getCategoryIcon(category: string): string {
    const found = this.categoryOptions.find(opt => opt.value === category);
    return found?.icon || '📋';
  }
  
  // الحصول على أيقونة الحالة
  getStatusIcon(status: string): string {
    const found = this.statusOptions.find(opt => opt.value === status);
    return found?.icon || '📝';
  }
  
  // التحقق إذا كانت المهمة مكتملة
  isCompleted(task: Task): boolean {
    return isTaskCompleted(task);
  }
  
  
  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }
  
  // تسجيل الخروج
  logout() {
    this.authService.logout();
  }
}