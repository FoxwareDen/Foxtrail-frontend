import { create } from 'zustand'
import { supabase, Job } from '../lib/supabaseClient'

interface JobsState {
  jobs: Job[]
  loading: boolean
  error: string | null
  currentJob: Job | null

  // Actions
  fetchJobs: () => Promise<void>
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

  fetchJobs: async () => {
    set({ loading: true, error: null })
    try {
      console.log('Fetching jobs from Supabase...')
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      set({ jobs: data || [], loading: false })
    } catch (error) {
      console.error('Fetch jobs error:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false
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
        loading: false
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
      set({ jobs: data || [], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search jobs',
        loading: false
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
      set({ jobs: data || [], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to filter jobs',
        loading: false
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
      set({ jobs: data || [], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to filter jobs',
        loading: false
      })
    }
  },

  clearError: () => set({ error: null }),
  setCurrentJob: (job: Job | null) => set({ currentJob: job }),
}))
