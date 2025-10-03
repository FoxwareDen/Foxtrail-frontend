// src/components/JobListing.tsx
import React, { useEffect } from 'react'
import { useJobsStore } from '../stores/jobsStores'
import { JobCard } from './JobCard'
import { JobFilters } from './JobFIlters'
import { JobModal } from './JobModal'
import { Job } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate();
  // handle back button logic
  const handleBack = () =>{
    navigate('/dashboard')
  }

  if (loading && jobs.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center w-full"
        style={{ backgroundColor: '#2b303a' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: '#D64933' }}
          ></div>
          <p className="text-lg" style={{ color: '#eee5e9' }}>Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 w-full overflow-x-hidden"
      style={{ backgroundColor: '#2b303a' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div 
            className="text-[#D64933] text-2xl cursor-pointer hover:text-orange-400 mb-4"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#eee5e9' }}>
            Job Listings
          </h1>
          <p style={{ color: '#717171' }}>
            Find your next opportunity from {jobs.length} available positions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="border rounded-md p-4 mb-6 w-full"
            style={{ 
              backgroundColor: '#D64933',
              borderColor: '#D64933'
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span style={{ color: '#eee5e9' }}>⚠️</span>
              </div>
              <div className="ml-3">
                <p style={{ color: '#eee5e9' }}>{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm underline hover:opacity-80"
                  style={{ color: '#eee5e9' }}
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
          <div className="flex justify-center mb-6 w-full">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderBottomColor: '#D64933' }}
            ></div>
          </div>
        )}

        {/* Job Grid */}
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-12 w-full">
            <p className="text-lg mb-4" style={{ color: '#717171' }}>
              No jobs found matching your criteria.
            </p>
            <button
              onClick={fetchJobs}
              className="px-6 py-2 text-white rounded-md hover:opacity-80"
              style={{ backgroundColor: '#D64933' }}
            >
              Show All Jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
          <div className="mt-8 text-center w-full">
            <button
              onClick={fetchJobs}
              className="px-6 py-3 border rounded-md hover:opacity-80 focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: '#92DCE5',
                borderColor: '#92DCE5',
                color: '#2b303a',
              }}
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