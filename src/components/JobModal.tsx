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
      <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#2b303a' }}
        >
          {/* Header */}
          <div 
            className="sticky top-0 border-b px-6 py-4 flex justify-between items-start rounded-t-lg"
            style={{ 
              backgroundColor: '#2b303a', 
              borderBottomColor: '#717171' 
            }}
          >
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#eee5e9' }}>
                {job.title}
              </h2>
              <p className="text-xl font-semibold" style={{ color: '#D64933' }}>
                {job.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl font-bold w-8 h-8 flex items-center justify-center hover:opacity-70"
              style={{ color: '#7c7c7c' }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Job Meta Information */}
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg"
              style={{ backgroundColor: '#92DCE5' }}
            >
              {job.location && (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7c7c7c' }}>Location</p>
                  <p className="flex items-center" style={{ color: '#2b303a' }}>
                    <span className="mr-2">📍</span>
                    {job.location}
                  </p>
                </div>
              )}
              
              {job.category && (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7c7c7c' }}>Category</p>
                  <p className="flex items-center" style={{ color: '#2b303a' }}>
                    <span className="mr-2">🏷️</span>
                    {job.category}
                  </p>
                </div>
              )}
              
              {job.contract && (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7c7c7c' }}>Contract Type</p>
                  <span 
                    className="inline-block text-sm font-medium px-3 py-1 rounded-full mt-1"
                    style={{ 
                      backgroundColor: '#92DCE5', 
                      color: '#2b303a' 
                    }}
                  >
                    {job.contract}
                  </span>
                </div>
              )}
            </div>

            {/* Job Description */}
            {job.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#eee5e9' }}>
                  Job Description
                </h3>
                <div className="prose max-w-none" style={{ color: '#717171' }}>
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
                <p style={{ color: '#7c7c7c' }}>Posted Date</p>
                <p className="font-medium" style={{ color: '#eee5e9' }}>
                  {job.listing_created_at ? formatDate(job.listing_created_at) : formatDate(job.created_at)}
                </p>
              </div>
              
              {job.api_id && (
                <div>
                  <p style={{ color: '#7c7c7c' }}>Reference ID</p>
                  <p className="font-medium font-mono" style={{ color: '#eee5e9' }}>
                    {job.api_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div 
            className="sticky bottom-0 border-t px-6 py-4 flex justify-between items-center rounded-b-lg"
            style={{ 
              backgroundColor: '#2b303a', 
              borderTopColor: '#717171' 
            }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-md hover:opacity-80 focus:ring-2 focus:outline-none"
              style={{ 
                borderColor: '#717171',
                color: '#eee5e9',
              }}
            >
              Close
            </button>
            
            <div className="flex space-x-3">
              {job.redirect_url && (
                <button
                  onClick={() => onApply(job)}
                  className="px-6 py-2 text-white rounded-md hover:opacity-80 focus:ring-2 focus:outline-none"
                  style={{ 
                    backgroundColor: '#D64933',
                    
                  }}
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
                className="px-6 py-2 rounded-md hover:opacity-80 focus:ring-2 focus:outline-none"
                style={{ 
                  backgroundColor: '#92DCE5',
                  color: '#2b303a',
                  
                }}
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