import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the shape of our app state
interface AppState {
    // UI State
    isLoading: boolean;
    theme: 'light' | 'dark';
    sidebarOpen: boolean;

    // User State (example)
    user: {
        id: string | null;
        name: string | null;
        email: string | null;
    } | null;

    // Actions
    setLoading: (loading: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSidebar: () => void;
    setUser: (user: AppState['user']) => void;
    clearUser: () => void;
}

// Create the store
export const useAppStore = create<AppState>()(
    devtools(
        (set) => ({
            // Initial state
            isLoading: false,
            theme: 'light',
            sidebarOpen: false,
            user: null,

            // Actions
            setLoading: (loading) =>
                set({ isLoading: loading }, false, 'setLoading'),

            setTheme: (theme) =>
                set({ theme }, false, 'setTheme'),

            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

            setUser: (user) =>
                set({ user }, false, 'setUser'),

            clearUser: () =>
                set({ user: null }, false, 'clearUser'),
        }),
        {
            name: 'app-store', // name for devtools
        }
    )
);

export default useAppStore; 