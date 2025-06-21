import useSWR from 'swr';
import { apiUrl } from '../lib/swr';

// Types for API responses
export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
}

// Custom hooks using SWR for data fetching
export const useUsers = () => {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse<User[]>>(
        apiUrl('/users')
    );

    return {
        users: data?.data,
        isLoading,
        isError: error,
        mutate,
    };
};

export const useUser = (id: string | null) => {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse<User>>(
        id ? apiUrl(`/users/${id}`) : null
    );

    return {
        user: data?.data,
        isLoading,
        isError: error,
        mutate,
    };
};

// API functions for mutations (POST, PUT, DELETE)
export const api = {
    // Create user
    createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await fetch(apiUrl('/users'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        return response.json();
    },

    // Update user
    updateUser: async (id: string, userData: Partial<User>) => {
        const response = await fetch(apiUrl(`/users/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        return response.json();
    },

    // Delete user
    deleteUser: async (id: string) => {
        const response = await fetch(apiUrl(`/users/${id}`), {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        return response.json();
    },
};

export default api; 