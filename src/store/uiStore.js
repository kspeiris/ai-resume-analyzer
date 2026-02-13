import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      unreadCount: 0,
      modals: {
        upload: false,
        share: false,
        delete: false,
        compare: false
      },
      toast: null,
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      })),
      
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      
      openModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: true }
      })),
      
      closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false }
      })),
      
      setToast: (toast) => set({ toast }),
      
      clearToast: () => set({ toast: null }),
      
      reset: () => set({
        theme: 'light',
        sidebarOpen: true,
        notifications: [],
        unreadCount: 0,
        modals: {
          upload: false,
          share: false,
          delete: false,
          compare: false
        },
        toast: null
      })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);

export default useUIStore;