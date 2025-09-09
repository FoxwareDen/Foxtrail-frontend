import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/LogoutButton'

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h2>
            <p>You are successfully logged in with Google OAuth via Supabase.</p>
            <div className="mt-4 space-y-2">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.user_metadata?.name}</p>
              <p><strong>Avatar:</strong></p>
              {user?.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard