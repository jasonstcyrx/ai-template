// Common types used throughout the application

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface User extends BaseEntity {
    name: string;
    email: string;
    role?: 'admin' | 'user' | 'moderator';
    avatar?: string;
    isActive?: boolean;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

// Form types
export interface FormState<T> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Navigation types
export interface NavItem {
    id: string;
    label: string;
    path: string;
    icon?: string;
    children?: NavItem[];
}

// Theme types
export type ThemeMode = 'light' | 'dark';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export default {}; 