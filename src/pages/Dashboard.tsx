import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/LogoutButton'
import { useNavigate } from 'react-router-dom'
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useState } from 'react';

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);

  const handleJobPreferences = () => {
    navigate("/job-preferences")
  }
 
  const handleUserPrefJobListing = () =>{
    navigate("/user-job-pref")
  }
  const handleExploreNewJobs = () => {
    navigate("/job-listings")
  }

  const handleQRAuthenticated = async () => {
    window.location.reload();
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2B303A' }}>
      <nav className="shadow-lg" style={{ backgroundColor: '#1f242c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#D64933' }}>
                FoxTrail
              </h1>
            </div>
            
            {/* Desktop user info and logout */}
            <div className="hidden sm:flex items-center space-x-4">
              <span 
                className="text-sm lg:text-base truncate max-w-xs lg:max-w-sm" 
                style={{ color: '#eee5e9' }}
                title={user?.user_metadata?.name || user?.email}
              >
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <LogoutButton />
            </div>
            
            {/* Mobile user info and logout */}
            <div className="flex sm:hidden items-center space-x-2">
              <span 
                className="text-xs truncate max-w-24" 
                style={{ color: '#eee5e9' }}
                title={user?.user_metadata?.name || user?.email}
              >
                {user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0]}
              </span>
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
            {/* QR Code Authentication Card (Desktop only) */}
<div 
  className="hidden sm:block rounded-lg shadow-lg p-6 mb-6 border" 
  style={{ 
    backgroundColor: '#3f4651',
    borderColor: '#D64933'
  }}
>
  <h3 className="text-xl font-bold mb-3" style={{ color: '#eee5e9' }}>
    Mobile Login
  </h3>
  <p className="mb-4" style={{ color: '#7c7c7c' }}>
    Scan this QR code with your mobile device to login securely
  </p>

  {showQRCode ? (
    <div className="flex flex-col items-center">
      <div className="relative bg-white rounded-lg p-3 mb-4 max-w-xs mx-auto">
        <QRCodeDisplay 
          onMobileAuthenticated={handleQRAuthenticated}
          onClose={handleCloseQRCode}
        />
      </div>
      <button
        onClick={() => setShowQRCode(false)}
        className="px-4 py-2 text-sm rounded border transition-colors duration-200"
        style={{ borderColor: '#D64933', color: '#D64933' }}
      >
        Close QR Code
      </button>
    </div>
  ) : (
    <div className="text-center">
      <button
        onClick={() => setShowQRCode(true)}
        className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-90 flex items-center justify-center mx-auto"
        style={{ backgroundColor: '#D64933', color: '#eee5e9' }}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        Generate QR Code for Mobile Login
      </button>
    </div>
  )}
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
              onClick={handleUserPrefJobListing}
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
                  style={{ backgroundColor: '#D64933' }}
                ></div>
                <h3 className="text-lg font-semibold" style={{ color: '#eee5e9' }}>Browse your prefered Jobs</h3>
              </div>
              <p style={{ color: '#7c7c7c' }}>Explore prefered Jobs</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard