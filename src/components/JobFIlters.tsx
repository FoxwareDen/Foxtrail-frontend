import React, { useState } from 'react'
import { useJobsStore } from '../stores/jobsStores'

export const JobFilters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  
  const { searchJobs, filterByCategory, filterByLocation, fetchJobs } = useJobsStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchJobs(searchQuery.trim())
    } else {
      fetchJobs()
    }
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    if (category) {
      filterByCategory(category)
    } else {
      fetchJobs()
    }
  }

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location)
    if (location) {
      filterByLocation(location)
    } else {
      fetchJobs()
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedLocation('')
    fetchJobs()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            🔍
          </button>
        </form>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>

        {/* Location Filter */}
        <select
          value={selectedLocation}
          onChange={(e) => handleLocationFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Locations</option>
          <option value="Remote">Remote</option>
          <option value="New York">New York</option>
          <option value="San Francisco">San Francisco</option>
          <option value="London">London</option>
          <option value="Berlin">Berlin</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}