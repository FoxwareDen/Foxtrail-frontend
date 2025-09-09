import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LogoutButtonProps {
  className?: string
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = "" }) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${className}`}
    >
      Sign Out
    </button>
  )
}

export default LogoutButton