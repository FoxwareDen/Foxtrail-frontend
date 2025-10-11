import React, { useState, useEffect } from 'react'
import { useJobsStore } from '../stores/jobsStores'
import { supabase } from '../lib/supabaseClient' // Adjust path as needed

export const JobFilters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [locations, setLocations] = useState<string[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  
  const { searchJobs, filterByCategory, filterByLocation, fetchJobs } = useJobsStore()

  // Fetch unique locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true)
        
        const { data: locationData, error: locationError } = await supabase
          .from('jobs')
          .select('location')
          .not('location', 'is', null)
          .not('location', 'eq', '')

        if (locationError) throw locationError

        // Extract unique locations and sort them
        const uniqueLocations = Array.from(
          new Set(locationData?.map(item => item.location?.trim()).filter(Boolean))
        ).sort()

        setLocations(uniqueLocations)
      } catch (err) {
        console.error('Error fetching locations:', err)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

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
    <div 
      className="rounded-lg mb-6 border-b-1 pb-4 border-[#D64933]"
      style={{ backgroundColor: '#2b303a' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l-md focus:ring-2 focus:outline-none"
            style={{ 
              backgroundColor: '#2b303a',
              borderColor: '#717171',
              color: '#eee5e9',
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-r-md hover:opacity-80 focus:ring-2 focus:outline-none"
            style={{ 
              backgroundColor: '#D64933',
            }}
          >
            🔍
          </button>
        </form>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
          style={{ 
            backgroundColor: '#2b303a',
            borderColor: '#717171',
            color: '#eee5e9',
            
          }}
        >
          <option value="">All Categories</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>

        {/* Location Filter - Now dynamic from database */}
        <select
          value={selectedLocation}
          onChange={(e) => handleLocationFilter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
          style={{ 
            backgroundColor: '#2b303a',
            borderColor: '#717171',
            color: '#eee5e9',
            
          }}
          disabled={loadingLocations}
        >
          <option value="">All Locations</option>
          {loadingLocations ? (
            <option value="" disabled>Loading locations...</option>
          ) : (
            locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))
          )}
        </select>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-md hover:opacity-80 focus:ring-2 focus:outline-none"
          style={{ 
            backgroundColor: '#92DCE5',
            color: '#2b303a',
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}