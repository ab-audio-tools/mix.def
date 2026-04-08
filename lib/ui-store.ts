import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIStore {
  // Animation states
  isAnimating: boolean;
  setAnimating: (isAnimating: boolean) => void;

  // Theme states
  glassIntensity: 'light' | 'medium' | 'heavy';
  setGlassIntensity: (intensity: 'light' | 'medium' | 'heavy') => void;

  // Loading states
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  clearLoading: (key: string) => void;

  // Modal states
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Motion preferences
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (value: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Animation states
  isAnimating: false,
  setAnimating: (isAnimating: boolean) =>
    set({ isAnimating }),

  // Theme states
  glassIntensity: 'medium',
  setGlassIntensity: (intensity: 'light' | 'medium' | 'heavy') =>
    set({ glassIntensity: intensity }),

  // Loading states
  loadingStates: {},
  setLoading: (key: string, isLoading: boolean) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    })),
  clearLoading: (key: string) =>
    set((state) => {
      const { [key]: _, ...rest } = state.loadingStates;
      return { loadingStates: rest };
    }),

  // Modal states
  activeModal: null,
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Toast notifications
  toasts: [],
  addToast: (toast: Omit<Toast, 'id'>) =>
    set((state) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: Toast = { ...toast, id };
      const updatedToasts = [...state.toasts, newToast];

      // Auto-remove after duration
      const duration = toast.duration ?? 3000;
      setTimeout(() => {
        get().removeToast(id);
      }, duration);

      return { toasts: updatedToasts };
    }),
  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),

  // Motion preferences
  prefersReducedMotion: false,
  setPrefersReducedMotion: (value: boolean) =>
    set({ prefersReducedMotion: value }),
}));
