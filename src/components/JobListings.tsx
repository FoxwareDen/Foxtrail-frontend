// src/components/JobListing.tsx
import React, { useEffect } from 'react'
import { useJobsStore } from '../stores/jobsStores'
import { JobCard } from './jobCard'
import { JobFilters } from './JobFIlters'
import { JobModal } from './JobModal'
import { Job } from '../lib/supabaseClient'

export const JobListing: React.FC = () => {
  const { 
    jobs, 
    loading, 
    error, 
    currentJob,
    fetchJobs, 
    clearError,
    setCurrentJob 
  } = useJobsStore()

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleJobClick = (job: Job) => {
    setCurrentJob(job)
  }

  const handleCloseModal = () => {
    setCurrentJob(null)
  }

  const handleApply = (job: Job) => {
    if (job.redirect_url) {
      // Open external URL in default browser (Tauri specific)
      window.open(job.redirect_url, '_blank')
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Job Listings
          </h1>
          <p className="text-gray-600">
            Find your next opportunity from {jobs.length} available positions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <JobFilters />

        {/* Loading indicator for filter operations */}
        {loading && jobs.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Job Grid */}
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
            <button
              onClick={fetchJobs}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Show All Jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={handleJobClick}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if you want pagination later) */}
        {jobs.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchJobs}
              className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              Refresh Jobs
            </button>
          </div>
        )}

        {/* Job Detail Modal */}
        {currentJob && (
          <JobModal
            job={currentJob}
            onClose={handleCloseModal}
            onApply={handleApply}
          />
        )}
      </div>
    </div>
  )
}