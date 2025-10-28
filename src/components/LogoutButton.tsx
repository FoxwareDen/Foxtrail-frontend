import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'minimal' | 'icon'
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "", 
  variant = 'default' 
}) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async (): Promise<void> => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Default button style
  if (variant === 'default') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          relative
          bg-[#D64933] hover:bg-[#c23a27] 
          active:bg-[#a82e1d]
          text-white font-medium 
          py-2 px-4 rounded-lg
          transition-all duration-200
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-lg hover:shadow-red-500/20
          active:scale-95
          group
          ${className}
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing Out...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span>Sign Out</span>
            </>
          )}
        </div>
      </button>
    )
  }

  // Minimal button style (for headers/navbars)
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          relative
          text-[#D64933] hover:text-white hover:bg-[#D64933]
          border border-[#D64933] hover:border-[#c23a27]
          active:bg-[#a82e1d]
          font-medium 
          py-1.5 px-3 rounded-md
          transition-all duration-200
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm
          group
          ${className}
        `}
      >
        <div className="flex items-center justify-center space-x-1.5">
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg 
              className="w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          )}
          <span>{isLoading ? '...' : 'Sign Out'}</span>
        </div>
      </button>
    )
  }

  // Icon-only button style
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        relative
        text-[#D64933] hover:text-white hover:bg-[#D64933]
        border border-[#D64933] hover:border-[#c23a27]
        active:bg-[#a82e1d]
        p-2 rounded-lg
        transition-all duration-200
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        group
        ${className}
      `}
      title="Sign Out"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg 
          className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      )}
    </button>
  )
}

export default LogoutButton