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
      <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-[#2b303a] to-[#1a1f29]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#D64933] border-t-transparent mx-auto mb-6"></div>
          <p className="text-xl font-medium text-[#eee5e9] mb-2">Loading Your Preferred Jobs</p>
          <p className="text-[#92DCE5] text-sm">Finding the perfect opportunities for you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 w-full overflow-x-hidden bg-gradient-to-br from-[#2b303a] to-[#1a1f29]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="group flex items-center space-x-3 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#D64933]/30 hover:bg-[#D64933]/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#D64933]/10"
            >
              <svg 
                className="w-5 h-5 text-[#D64933] transition-transform group-hover:-translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              <span className="text-[#eee5e9] font-semibold group-hover:text-white transition-colors">
                Back to Dashboard
              </span>
            </button>
            
            <div className="text-right">
              <div className="text-sm text-[#92DCE5] bg-white/5 px-3 py-1 rounded-full">
                {totalJobs} total opportunities
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#eee5e9] bg-gradient-to-r from-[#eee5e9] to-[#92DCE5] bg-clip-text text-transparent">
              Your Preferred Jobs
            </h1>
            <p className="text-lg text-[#92DCE5] max-w-2xl mx-auto">
              Curated opportunities that match your skills and preferences
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#eee5e9]">{jobs.length}</div>
              <div className="text-sm text-[#92DCE5]">Current Page</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#eee5e9]">{totalJobs}</div>
              <div className="text-sm text-[#92DCE5]">Total Jobs</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#eee5e9]">{currentPage}</div>
              <div className="text-sm text-[#92DCE5]">Current Page</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#D64933] to-[#c23a27] border border-[#D64933]/30 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-white font-medium">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-4 px-4 py-2 text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator for subsequent loads */}
        {loading && jobs.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#92DCE5] border-t-transparent"></div>
              <span className="text-[#92DCE5] font-medium">Loading more jobs...</span>
            </div>
          </div>
        )}

        {/* Job Grid */}
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#92DCE5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#eee5e9] mb-3">No Preferred Jobs Found</h3>
            <p className="text-[#92DCE5] mb-2 max-w-md mx-auto">
              We couldn't find any jobs matching your current preferences.
            </p>
            <p className="text-[#92DCE5] text-sm mb-8">
              Try updating your preferences to see more relevant opportunities.
            </p>
            <button
              onClick={() => navigate('/job-preferences')}
              className="px-8 py-3 bg-gradient-to-r from-[#D64933] to-[#c23a27] text-white rounded-xl hover:shadow-lg hover:shadow-[#D64933]/20 transition-all duration-300 font-semibold hover:scale-105"
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
          <div className="flex justify-center items-center mt-12 space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed bg-white/5 text-[#717171]' 
                  : 'bg-white/5 text-[#eee5e9] hover:bg-[#D64933] hover:text-white hover:shadow-lg hover:shadow-[#D64933]/20 border border-white/10 hover:border-[#D64933]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                    currentPage === pageNumber
                      ? 'bg-gradient-to-r from-[#D64933] to-[#c23a27] text-white shadow-lg shadow-[#D64933]/20 scale-110'
                      : 'bg-white/5 text-[#eee5e9] hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed bg-white/5 text-[#717171]' 
                  : 'bg-white/5 text-[#eee5e9] hover:bg-[#D64933] hover:text-white hover:shadow-lg hover:shadow-[#D64933]/20 border border-white/10 hover:border-[#D64933]'
              }`}
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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