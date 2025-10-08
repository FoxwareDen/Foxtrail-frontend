// src/components/UserPrefJobListing.tsx
import React, { useEffect } from 'react'
import { JobCard } from '../components/JobCard'
import { JobModal } from '../components/JobModal'
import { useJobsStore } from '../stores/jobsStores'
import { useNavigate } from 'react-router-dom'
import { Job } from '../lib/supabaseClient'

const UserPrefJobListing: React.FC = () => {
  const {
    jobs,
    loading,
    error,
    currentJob,
    totalJobs,
    fetchUserPreferredJobs,
    setCurrentJob,
    clearError
  } = useJobsStore()

  const [currentPage, setCurrentPage] = React.useState(1)
  const jobsPerPage = 9

  useEffect(() => {
    fetchUserPreferredJobs(currentPage, jobsPerPage)
  }, [currentPage, fetchUserPreferredJobs])

  const handleJobClick = (job: Job) => {
    setCurrentJob(job)
  }

  const handleCloseModal = () => {
    setCurrentJob(null)
  }

  const handleApply = (job: Job) => {
    if (job.redirect_url) {
      window.open(job.redirect_url, '_blank')
    }
  }

  const navigate = useNavigate()
  const handleBack = () => {
    navigate('/dashboard')
  }

  // Pagination logic
  const totalPages = Math.ceil(totalJobs / jobsPerPage)
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-[#2b303a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4 border-[#D64933]"></div>
          <p className="text-lg text-[#eee5e9]">Loading your preferred jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 w-full overflow-x-hidden bg-[#2b303a]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div 
            className="text-[#D64933] text-2xl cursor-pointer hover:text-orange-400 mb-4"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#eee5e9]">
            Your Preferred Jobs
          </h1>
          <p className="text-[#717171]">
            Showing {jobs.length} of {totalJobs} jobs • Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border rounded-md p-4 mb-6 w-full bg-[#D64933] border-[#D64933]">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-[#eee5e9]">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-[#eee5e9]">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm underline hover:opacity-80 text-[#eee5e9]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && jobs.length > 0 && (
          <div className="flex justify-center mb-6 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D64933]"></div>
          </div>
        )}

        {/* Job Grid */}
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-12 w-full">
            <p className="text-lg mb-4 text-[#717171]">
              No preferred jobs found in your feed.
            </p>
            <p className="text-sm mb-6 text-[#717171]">
              Jobs will appear here as they match your preferences.
            </p>
            <button
              onClick={() => navigate('/job-preferences')}
              className="px-6 py-2 text-white rounded-md hover:opacity-80 bg-[#D64933]"
            >
              Update Preferences
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {jobs.map((job: Job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={handleJobClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalJobs > jobsPerPage && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 
                ? 'opacity-50 cursor-not-allowed bg-[#717171]' 
                : 'hover:opacity-80 bg-[#D64933]'
              } text-[#eee5e9]`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-[#D64933] text-white'
                    : 'bg-[#eee5e9] text-[#2b303a] hover:opacity-80'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages 
                ? 'opacity-50 cursor-not-allowed bg-[#717171]' 
                : 'hover:opacity-80 bg-[#D64933]'
              } text-[#eee5e9]`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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

export default UserPrefJobListing