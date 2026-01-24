export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    USERS: '/users',
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    TASKS: '/tasks',
    USER_TASKS: '/tasks/user'
  }
};

export const STORAGE_KEYS = {
  CURRENT_USER: 'todo_current_user',
  AUTH_TOKEN: 'todo_auth_token'
};

export const CATEGORIES = {
  WORK: 'travail',
  STUDY: 'étude',
  PERSONAL: 'personnel'
} as const;

export const PRIORITIES = {
  LOW: 'faible',
  MEDIUM: 'moyenne',
  HIGH: 'haute'
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
} as const;

export const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const DAYS_OF_WEEK = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];