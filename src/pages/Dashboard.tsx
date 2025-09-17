import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/LogoutButton'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate();

  const handleJobPreferences = () => {
    // Navigate to job preferences page
    navigate("/job-preferences")
  }
  const handleExploreNewJobs = () =>{
    navigate("/job-listings")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2B303A' }}>
      <nav className="shadow-lg" style={{ backgroundColor: '#1f242c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#D64933' }}>FoxTrail</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span style={{ color: '#eee5e9' }}>
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Main Dashboard Card */}
          <div 
            className="rounded-lg shadow-lg p-6 mb-6" 
            style={{ backgroundColor: '#353b47' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#eee5e9' }}>Dashboard</h2>
            <p className="mb-6" style={{ color: '#7c7c7c' }}>Welcome to your FoxTrail dashboard! Manage your job search and preferences.</p>
            
            {/* Job Preferences Button */}
            <div className="mb-8">
              <button 
                onClick={handleJobPreferences}
                className="px-8 py-3 rounded-full text-lg font-medium transition-colors duration-200 hover:opacity-90"
                style={{ backgroundColor: '#D64933', color: '#eee5e9' }}
              >
                Set Job Preferences
              </button>
            </div>

            {/* User Profile Section */}
            <div 
              className="rounded-lg p-6" 
              style={{ backgroundColor: '#3f4651' }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#eee5e9' }}>Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: '#7c7c7c' }}>User ID</p>
                    <p className="font-medium" style={{ color: '#eee5e9' }}>{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7c7c7c' }}>Email</p>
                    <p className="font-medium" style={{ color: '#eee5e9' }}>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7c7c7c' }}>Name</p>
                    <p className="font-medium" style={{ color: '#eee5e9' }}>{user?.user_metadata?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  {user?.user_metadata?.avatar_url && (
                    <div className="text-center">
                      <p className="text-sm mb-2" style={{ color: '#7c7c7c' }}>Profile Picture</p>
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full border-2"
                        style={{ borderColor: '#D64933' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="rounded-lg p-6 transition-all duration-200 cursor-pointer hover:scale-105"
              style={{ 
                backgroundColor: '#353b47',
                boxShadow: '0 4px 6px -1px rgba(214, 73, 51, 0.1)'
              }}
              onClick={handleExploreNewJobs}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3f4651';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#353b47';
              }}
            >
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: '#92DCE5' }}
                ></div>
                <h3 className="text-lg font-semibold" style={{ color: '#eee5e9' }}>Browse Jobs</h3>
              </div>
              <p style={{ color: '#7c7c7c' }}>Discover new opportunities</p>
            </div>
            
            <div 
              className="rounded-lg p-6 transition-all duration-200 cursor-pointer hover:scale-105"
              style={{ 
                backgroundColor: '#353b47',
                boxShadow: '0 4px 6px -1px rgba(214, 73, 51, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3f4651';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#353b47';
              }}
            >
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: '#92DCE5' }}
                ></div>
                <h3 className="text-lg font-semibold" style={{ color: '#eee5e9' }}>My Applications</h3>
              </div>
              <p style={{ color: '#7c7c7c' }}>Track your job applications</p>
            </div>
            
            <div 
              className="rounded-lg p-6 transition-all duration-200 cursor-pointer hover:scale-105"
              style={{ 
                backgroundColor: '#353b47',
                boxShadow: '0 4px 6px -1px rgba(214, 73, 51, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3f4651';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#353b47';
              }}
            >
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: '#92DCE5' }}
                ></div>
                <h3 className="text-lg font-semibold" style={{ color: '#eee5e9' }}>Profile Settings</h3>
              </div>
              <p style={{ color: '#7c7c7c' }}>Update your information</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard