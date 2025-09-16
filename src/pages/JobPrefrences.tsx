import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JobPreferences: React.FC = () => {
  const [location, setLocation] = useState('Cape Town, South Africa');
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('Entry level');
  const [jobTitle, setJobTitle] = useState('Software developer');

  const workModes = ['Remote', 'Hybrid', 'On-Site'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Commission'];
  const experienceLevels = ['Entry level', 'Mid level', 'Senior level'];
  const jobTitles = ['Software developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager'];
  
  const navigate = useNavigate();

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

  const handleApply = () => {
    const preferences = {
      location,
      selectedWorkModes,
      selectedJobTypes,
      experienceLevel,
      jobTitle
    };
    console.log('Job Preferences:', preferences);
    // Handle form submission here
  };

  const handleBack = () => {
    // Handle back navigation
    navigate("/dashboard")
  };

  return (
    <div className="bg-[#2B303A] text-white min-h-screen p-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div 
            className="text-[#D64933] text-2xl cursor-pointer hover:text-orange-400"
            onClick={handleBack}
          >
            ↺
          </div>
          <div className="text-[#D64933] text-2xl font-bold">
            FoxTrail
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-light mb-8">Filter Job preferences</h1>

        {/* Location Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="bg-transparent rounded-full px-4 py-3 flex items-center border border-slate-500">
            <div className="w-4 h-4 border-none border-white rounded-full mr-3 flex items-center justify-center">
              <svg viewBox="-4 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"  fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>location</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Icon-Set" transform="translate(-104.000000, -411.000000)" fill="#ffffff"> <path d="M116,426 C114.343,426 113,424.657 113,423 C113,421.343 114.343,420 116,420 C117.657,420 119,421.343 119,423 C119,424.657 117.657,426 116,426 L116,426 Z M116,418 C113.239,418 111,420.238 111,423 C111,425.762 113.239,428 116,428 C118.761,428 121,425.762 121,423 C121,420.238 118.761,418 116,418 L116,418 Z M116,440 C114.337,440.009 106,427.181 106,423 C106,417.478 110.477,413 116,413 C121.523,413 126,417.478 126,423 C126,427.125 117.637,440.009 116,440 L116,440 Z M116,411 C109.373,411 104,416.373 104,423 C104,428.018 114.005,443.011 116,443 C117.964,443.011 128,427.95 128,423 C128,416.373 122.627,411 116,411 L116,411 Z" id="location" > </path> </g> </g> </g></svg>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent outline-none text-white w-full"
              placeholder="Enter location"
            />
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
          <h2 className="text-xl font-bold mb-4">Job title</h2>
          <div className="relative">
            <select 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-transparent border border-slate-500 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:bg-slate-500 transition-colors"
            >
              {jobTitles.map((title) => (
                <option key={title} value={title} className="bg-slate-600">
                  {title}
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

        {/* Apply Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleApply}
            className="bg-[#D64933] hover:bg-orange-600 text-white px-16 py-4 rounded-full text-lg font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPreferences;