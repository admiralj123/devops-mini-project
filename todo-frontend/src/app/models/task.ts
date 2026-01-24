export interface Task {
  id?: number;
  title: string;
  description?: string;
  category: 'travail' | 'étude' | 'personnel';
  priority: 'faible' | 'moyenne' | 'haute';
  dueDate?: string; // تاريخ الاستحقاق (YYYY-MM-DD)
  status: 'Pending' | 'Done'; // استخدام status بدلاً من completed
  user?: any; // المستخدم المرتبط
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  category: string;
  priority: string;
  dueDate?: string;
}

// ثوابت للتصنيفات والأولويات
export const CATEGORIES = {
  TRAVAIL: 'travail' as Task['category'],
  ETUDE: 'étude' as Task['category'],
  PERSONNEL: 'personnel' as Task['category']
} as const;

export const PRIORITIES = {
  FAIBLE: 'faible' as Task['priority'],
  MOYENNE: 'moyenne' as Task['priority'],
  HAUTE: 'haute' as Task['priority']
} as const;

export const STATUS = {
  PENDING: 'Pending' as Task['status'],
  DONE: 'Done' as Task['status']
} as const;

// خيارات العرض
export const CATEGORY_OPTIONS = [
  { value: CATEGORIES.TRAVAIL, label: 'Travail', icon: '💼', color: '#4299e1' },
  { value: CATEGORIES.ETUDE, label: 'Étude', icon: '📚', color: '#ed8936' },
  { value: CATEGORIES.PERSONNEL, label: 'Personnel', icon: '🏠', color: '#48bb78' }
];

export const PRIORITY_OPTIONS = [
  { value: PRIORITIES.FAIBLE, label: 'Faible', color: '#48bb78', bgColor: '#c6f6d5' },
  { value: PRIORITIES.MOYENNE, label: 'Moyenne', color: '#ed8936', bgColor: '#feebc8' },
  { value: PRIORITIES.HAUTE, label: 'Haute', color: '#f56565', bgColor: '#fed7d7' }
];

export const STATUS_OPTIONS = [
  { value: STATUS.PENDING, label: 'En attente', icon: '⏳', color: '#a0aec0' },
  { value: STATUS.DONE, label: 'Terminée', icon: '✅', color: '#48bb78' }
];

// دالة مساعدة للتحويل
export function isTaskCompleted(task: Task): boolean {
  return task.status === 'Done';
}

export function mapToTaskCreateDto(task: Partial<Task>): TaskCreateDto {
  return {
    title: task.title || '',
    description: task.description,
    category: task.category || CATEGORIES.TRAVAIL,
    priority: task.priority || PRIORITIES.MOYENNE,
    dueDate: task.dueDate
  };
}