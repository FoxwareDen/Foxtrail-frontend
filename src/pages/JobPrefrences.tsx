import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // Adjust path as needed

interface UniqueValues {
  locations: string[];
  jobTitles: string[];
}

const JobPreferences: React.FC = () => {
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('Entry level');
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  
  // Database values
  const [uniqueValues, setUniqueValues] = useState<UniqueValues>({
    locations: [],
    jobTitles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map countries to their default cities
  const countryCityMap: { [key: string]: string } = {
    'South Africa': 'Cape Town',
    'United States': 'New York',
    'Netherlands': 'Amsterdam',
    'United Kingdom': 'London',
    'Germany': 'Berlin'
  };

  const workModes = ['Remote', 'Hybrid', 'On-Site'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Commission'];
  const experienceLevels = ['Entry level', 'Mid level', 'Senior level'];
  
  const navigate = useNavigate();

  // Fetch unique values from database
  useEffect(() => {
    const fetchUniqueValues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch unique locations
        const { data: locationData, error: locationError } = await supabase
          .from('location_form_data')
          .select('country')
          .not('country', 'is', null)
          .not('country', 'eq', '');

        if (locationError) throw locationError;

        // Fetch unique job titles
        const { data: titleData, error: titleError } = await supabase
          .from('jobs')
          .select('title')
          .not('title', 'is', null)
          .not('title', 'eq', '');

        if (titleError) throw titleError;

        // Extract unique values and sort them
        const uniqueLocations = Array.from(
          new Set(locationData?.map(item => item.country?.trim()).filter(Boolean))
        ).sort();

        const uniqueTitles = Array.from(
          new Set(titleData?.map(item => item.title?.trim()).filter(Boolean))
        ).sort();

        setUniqueValues({
          locations: uniqueLocations,
          jobTitles: uniqueTitles
        });

      } catch (err) {
        console.error('Error fetching unique values:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUniqueValues();
  }, []);

  // Auto-set city when location (country) changes
  useEffect(() => {
    if (location && countryCityMap[location]) {
      setCity(countryCityMap[location]);
    } else {
      setCity('');
    }
  }, [location]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const toggleWorkMode = (mode: string) => {
    setSelectedWorkModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const toggleJobType = (type: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleJobTitle = (title: string) => {
    setSelectedJobTitles(prev => {
      if (prev.includes(title)) {
        return prev.filter(t => t !== title);
      } else if (prev.length < 3) {
        return [...prev, title];
      }
      return prev; // Don't add if already at max
    });
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('You must be logged in to save preferences');
      }

      const preferences = {
        user_id: user.id,
        country: location,
        city,
        work_modes: selectedWorkModes,
        job_types: selectedJobTypes,
        experience_level: experienceLevel,
        job_titles: selectedJobTitles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving job preferences:', preferences);

      const { data, error } = await supabase
        .from('user_job_pref')
        .insert([preferences])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Job preferences saved successfully:', data);
      setSuccessMessage('Your job preferences have been set! You will now receive notifications based on your job preferences.');
      
    } catch (err) {
      console.error('Error saving job preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save job preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard")
  };

  if (loading) {
    return (
      <div className="bg-[#2B303A] text-white min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D64933] mx-auto mb-4"></div>
          <p>Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2B303A] text-white min-h-screen p-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div 
            className="text-[#D64933] text-2xl cursor-pointer hover:text-orange-400"
            onClick={handleBack}
          >
            ←
          </div>
          <div className="text-[#D64933] text-2xl font-bold">
            FoxTrail
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-light mb-8">Filter Job preferences</h1>

        {/* Location Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="relative">
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border border-slate-500 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:bg-slate-600 transition-colors"
              disabled={uniqueValues.locations.length === 0}
            >
              <option value="" className="bg-slate-600">
                {uniqueValues.locations.length === 0 ? 'Loading locations...' : 'Select a location'}
              </option>
              {uniqueValues.locations.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-600">
                  {loc}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className="w-4 h-4 text-[#D64933]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Work Mode Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Work Mode</h2>
          <div className="flex flex-wrap gap-3">
            {workModes.map((mode) => (
              <button
                key={mode}
                onClick={() => toggleWorkMode(mode)}
                className={`px-6 py-2 rounded-full border-2 transition-colors ${
                  selectedWorkModes.includes(mode)
                    ? 'border-[#D64933] bg-[#D64933] text-white'
                    : 'border-[#D64933] text-white bg-transparent hover:bg-[#D64933]/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Job Type</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-3 mb-2">
              {jobTypes.slice(0, 3).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleJobType(type)}
                  className={`px-6 py-2 rounded-full border-2 transition-colors ${
                    selectedJobTypes.includes(type)
                      ? 'border-[#D64933] bg-[#D64933] text-white'
                      : 'border-[#D64933] text-white bg-transparent hover:bg-[#D64933]/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {jobTypes.slice(3).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleJobType(type)}
                  className={`px-6 py-2 rounded-full border-2 transition-colors ${
                    selectedJobTypes.includes(type)
                      ? 'border-[#D64933] bg-[#D64933] text-white'
                      : 'border-[#D64933] text-white bg-transparent hover:bg-[#D64933]/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Experience Level Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Experience level</h2>
          <div className="flex items-center gap-6">
            {experienceLevels.map((level) => (
              <div key={level} className="flex items-center">
                <button
                  onClick={() => setExperienceLevel(level)}
                  className={`w-6 h-6 border-2 rounded-full mr-2 transition-colors ${
                    experienceLevel === level
                      ? 'border-[#D64933] bg-[#D64933]'
                      : 'border-white bg-transparent hover:border-[#D64933]'
                  }`}
                />
                <span className="cursor-pointer" onClick={() => setExperienceLevel(level)}>
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Title Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Job title (Select up to 3)</h2>
          <div className="mb-2">
            <p className="text-sm text-gray-400">
              Selected: {selectedJobTitles.length}/3
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {uniqueValues.jobTitles.map((title) => (
              <button
                key={title}
                onClick={() => toggleJobTitle(title)}
                disabled={!selectedJobTitles.includes(title) && selectedJobTitles.length >= 3}
                className={`px-4 py-2 rounded-full border-2 transition-colors text-sm ${
                  selectedJobTitles.includes(title)
                    ? 'border-[#D64933] bg-[#D64933] text-white'
                    : 'border-[#D64933] text-white bg-transparent hover:bg-[#D64933]/10 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleApply}
            disabled={!location || !city || selectedJobTitles.length === 0 || saving}
            className="bg-[#D64933] hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-16 py-4 rounded-full text-lg font-medium transition-colors flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {saving ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPreferences;