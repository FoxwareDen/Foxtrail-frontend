import { User, Session } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithLinkedIn: () => Promise<void>
  signOut: () => Promise<void>
}

export interface AuthProviderProps {
  children: React.ReactNode
}

export interface ProtectedRouteProps {
  children: React.ReactNode
}