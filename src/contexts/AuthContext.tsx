import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { platform } from '@tauri-apps/plugin-os'
import { AUTH_CONFIG } from '../config/auth'
import { signIn, signOut as googleSignOut } from '@choochmeque/tauri-plugin-google-auth-api'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithLinkedIn: () => Promise<void>
  signInWithGoogleSDK: () => Promise<void>
  getGoogleOAuthUrl: () => Promise<string>
  getLinkedInOAuthUrl: () => Promise<string>
  signOut: () => Promise<void>
}

interface AuthProviderProps {
  children: React.ReactNode
}

// Use the actual TokenResponse type from the plugin
interface TokenResponse {
  idToken: string
  accessToken: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const platformName = await platform()
        setIsMobile(platformName === 'android' || platformName === 'ios')
      } catch (error) {
        console.error('Platform detection failed:', error)
        setIsMobile(false)
      }
    }
    checkPlatform()
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // Fixed Google SDK sign-in method
  const signInWithGoogleSDK = async (): Promise<void> => {
    try {
      console.log('🚀 Starting Google SDK authentication')
      console.log('Using client ID:', AUTH_CONFIG.google.androidClientId)

      // Use the plugin's signIn function
      const response = await signIn({
        clientId: AUTH_CONFIG.google.androidClientId,
        scopes: ['openid', 'email', 'profile'],
      })

      console.log('✅ Google SDK authentication successful!')
      console.log('ID Token received:', !!response.idToken)
      console.log('Access Token received:', !!response.accessToken)

      // Validate that we have the required tokens
      if (!response.idToken) {
        throw new Error('No ID token received from Google authentication')
      }

      if (!response.accessToken) {
        throw new Error('No access token received from Google authentication')
      }

      // Exchange the tokens with Supabase
      console.log('🔄 Exchanging tokens with Supabase...')
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.idToken, // This is now guaranteed to be a string
        access_token: response.accessToken, // This is now guaranteed to be a string
      })

      if (error) {
        console.error('❌ Supabase auth error:', error)
        throw error
      }

      console.log('✅ Successfully authenticated with Supabase!')
      console.log('User email:', data.user?.email)
    } catch (error: unknown) {
      console.error('❌ Error signing in with Google SDK:', error)
      
      // Enhanced error logging with type guard
      if (error instanceof Error && error.message.includes('OAuth consent screen')) {
        console.error('🔧 OAuth Consent Screen Issue - Check:')
        console.error('1. Google Cloud Console → OAuth consent screen is configured')
        console.error('2. Your email is added as a test user')
        console.error('3. All required fields are filled')
        console.error('4. You are using the correct project')
      }
      
      throw error
    }
  }

  const signInWithLinkedIn = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error)
      throw error
    }
  }

  const getGoogleOAuthUrl = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: true
        }
      })
      if (error) throw error
      return data.url || ''
    } catch (error) {
      console.error('Error getting Google OAuth URL:', error)
      throw error
    }
  }

  const getLinkedInOAuthUrl = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: true
        }
      })
      if (error) throw error
      return data.url || ''
    } catch (error) {
      console.error('Error getting LinkedIn OAuth URL:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      // Sign out from Google SDK if we have a session
      if (session?.provider_token) {
        try {
          await googleSignOut({ accessToken: session.provider_token })
          console.log('Signed out from Google SDK')
        } catch (googleSignOutError) {
          console.warn('Google SDK sign out failed, continuing with Supabase sign out:', googleSignOutError)
        }
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithGoogleSDK,
    getGoogleOAuthUrl,
    getLinkedInOAuthUrl,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}