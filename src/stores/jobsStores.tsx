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
  fetchUserPreferredJobs: (page?: number, limit?: number) => Promise<void>
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

  fetchUserPreferredJobs: async (page = 1, limit = 9) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const start = (page - 1) * limit
      const end = start + limit - 1

      // First get job IDs from feed table
      const { data: feedData, error: feedError, count } = await supabase
        .from('feed')
        .select('job_id', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(start, end)

      if (feedError) throw feedError

      if (!feedData || feedData.length === 0) {
        set({
          jobs: [],
          totalJobs: count || 0,
          loading: false,
          error: null,
        })
        return
      }

      // Extract job IDs and fetch job details
      const jobIds = feedData.map(item => item.job_id).filter(Boolean)
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', jobIds)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      set({
        jobs: jobsData || [],
        totalJobs: count || 0,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch preferred jobs',
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