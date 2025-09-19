import React from 'react'
import { Job } from '../lib/supabaseClient'

interface JobCardProps {
  job: Job
  onClick: (job: Job) => void
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div 
      className="rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border"
      style={{ 
        backgroundColor: '#2b303a', 
        borderColor: '#717171',
        color: '#eee5e9' 
      }}
      onClick={() => onClick(job)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2" style={{ color: '#eee5e9' }}>
            {job.title}
          </h3>
          <p className="text-lg font-medium mb-1" style={{ color: '#D64933' }}>
            {job.company}
          </p>
        </div>
        <div className="ml-4">
          {job.contract && (
            <span 
              className="inline-block text-sm font-medium px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: '#92DCE5', 
                color: '#2b303a' 
              }}
            >
              {job.contract}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {job.location && (
          <p className="flex items-center" style={{ color: '#7c7c7c' }}>
            <span className="mr-2">📍</span>
            {job.location}
          </p>
        )}
        {job.category && (
          <p className="flex items-center" style={{ color: '#7c7c7c' }}>
            <span className="mr-2">🏷️</span>
            {job.category}
          </p>
        )}
      </div>

      {job.description && (
        <p className="text-sm line-clamp-3 mb-4" style={{ color: '#eee5e9' }}>
          {job.description}
        </p>
      )}

      <div className="flex justify-between items-center text-sm" style={{ color: '#7c7c7c' }}>
        <span>
          Posted: {job.listing_created_at ? formatDate(job.listing_created_at) : formatDate(job.created_at)}
        </span>
        <span className="hover:opacity-80" style={{ color: '#D64933' }}>
          View Details →
        </span>
      </div>
    </div>
  )
}