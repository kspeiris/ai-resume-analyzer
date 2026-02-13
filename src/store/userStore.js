import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      profile: null,
      settings: {
        emailNotifications: true,
        darkMode: false,
        language: 'en',
        autoSave: true,
        analysisHistory: true
      },
      preferences: {
        defaultJobTitle: '',
        defaultCompany: '',
        emailFrequency: 'weekly'
      },
      
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      
      incrementAnalysesCount: () => set((state) => ({
        profile: state.profile 
          ? { ...state.profile, analysesCount: (state.profile.analysesCount || 0) + 1 }
          : null
      })),
      
      reset: () => set({
        profile: null,
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en',
          autoSave: true,
          analysisHistory: true
        },
        preferences: {
          defaultJobTitle: '',
          defaultCompany: '',
          emailFrequency: 'weekly'
        }
      })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        settings: state.settings,
        preferences: state.preferences
      })
    }
  )
);

export default useUserStore;