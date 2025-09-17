// src/components/JobModal.tsx
import React, { useEffect } from 'react'
import { Job } from '../lib/supabaseClient'

interface JobModalProps {
  job: Job
  onClose: () => void
  onApply: (job: Job) => void
}

export const JobModal: React.FC<JobModalProps> = ({ job, onClose, onApply }) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden' // Prevent background scrolling
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start rounded-t-lg">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {job.title}
              </h2>
              <p className="text-xl text-blue-600 font-semibold">
                {job.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Job Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              {job.location && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900 flex items-center">
                    <span className="mr-2">📍</span>
                    {job.location}
                  </p>
                </div>
              )}
              
              {job.category && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-gray-900 flex items-center">
                    <span className="mr-2">🏷️</span>
                    {job.category}
                  </p>
                </div>
              )}
              
              {job.contract && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contract Type</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mt-1">
                    {job.contract}
                  </span>
                </div>
              )}
            </div>

            {/* Job Description */}
            {job.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Job Description
                </h3>
                <div className="prose max-w-none text-gray-700">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Posted Date</p>
                <p className="text-gray-900 font-medium">
                  {job.listing_created_at ? formatDate(job.listing_created_at) : formatDate(job.created_at)}
                </p>
              </div>
              
              {job.api_id && (
                <div>
                  <p className="text-gray-500">Reference ID</p>
                  <p className="text-gray-900 font-medium font-mono">
                    {job.api_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-lg">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
            
            <div className="flex space-x-3">
              {job.redirect_url && (
                <button
                  onClick={() => onApply(job)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Apply Now
                </button>
              )}
              
              <button
                onClick={() => {
                  // Copy job URL or details to clipboard
                  navigator.clipboard.writeText(
                    `${job.title} at ${job.company}\n${job.redirect_url || ''}`
                  )
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
              >
                Share Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}