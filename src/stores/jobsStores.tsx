import { create } from 'zustand'
import { supabase, Job } from '../lib/supabaseClient'

interface JobsState {
  jobs: Job[]
  loading: boolean
  error: string | null
  currentJob: Job | null
  totalJobs: number

  // Actions
  fetchJobs: (page?: number, limit?: number) => Promise<void>
  fetchJobById: (id: string) => Promise<void>
  searchJobs: (query: string) => Promise<void>
  filterByCategory: (category: string) => Promise<void>
  filterByLocation: (location: string) => Promise<void>
  clearError: () => void
  setCurrentJob: (job: Job | null) => void
}

export const useJobsStore = create<JobsState>((set, _get) => ({
  jobs: [],
  loading: false,
  error: null,
  currentJob: null,
  totalJobs: 0,

  fetchJobs: async (page = 1, limit = 9) => {
    set({ loading: true, error: null })
    try {
      const start = (page - 1) * limit
      const end = start + limit - 1

      const { data, error, count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error

      set({
        jobs: data || [],
        totalJobs: count || 0,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false,
      })
    }
  },

  fetchJobById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      set({ currentJob: data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch job',
        loading: false,
      })
    }
  },

  searchJobs: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ jobs: data || [], totalJobs: data?.length || 0, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search jobs',
        loading: false,
      })
    }
  },

  filterByCategory: async (category: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ jobs: data || [], totalJobs: data?.length || 0, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to filter jobs',
        loading: false,
      })
    }
  },

  filterByLocation: async (location: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ jobs: data || [], totalJobs: data?.length || 0, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to filter jobs',
        loading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  setCurrentJob: (job: Job | null) => set({ currentJob: job }),
}))
