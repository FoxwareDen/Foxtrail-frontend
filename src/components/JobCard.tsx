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
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onClick(job)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {job.title}
          </h3>
          <p className="text-lg text-blue-600 font-medium mb-1">
            {job.company}
          </p>
        </div>
        <div className="ml-4">
          {job.contract && (
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {job.contract}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {job.location && (
          <p className="text-gray-600 flex items-center">
            <span className="mr-2">📍</span>
            {job.location}
          </p>
        )}
        {job.category && (
          <p className="text-gray-600 flex items-center">
            <span className="mr-2">🏷️</span>
            {job.category}
          </p>
        )}
      </div>

      {job.description && (
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {job.description}
        </p>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          Posted: {job.listing_created_at ? formatDate(job.listing_created_at) : formatDate(job.created_at)}
        </span>
        <span className="text-blue-600 hover:text-blue-800">
          View Details →
        </span>
      </div>
    </div>
  )
}