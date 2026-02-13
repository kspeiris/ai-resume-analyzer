import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAnalysisStore = create(
  persist(
    (set, get) => ({
      currentAnalysis: null,
      analyses: [],
      loading: false,
      error: null,

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [analysis, ...state.analyses],
        })),

      updateAnalysis: (id, updates) =>
        set((state) => ({
          analyses: state.analyses.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          currentAnalysis:
            state.currentAnalysis?.id === id
              ? { ...state.currentAnalysis, ...updates }
              : state.currentAnalysis,
        })),

      removeAnalysis: (id) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.id !== id),
          currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis,
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          currentAnalysis: null,
          analyses: [],
          loading: false,
          error: null,
        }),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({
        analyses: state.analyses.slice(0, 10), // Only persist last 10 analyses
      }),
    }
  )
);

export default useAnalysisStore;
