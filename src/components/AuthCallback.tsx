import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically processes the hash fragment
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login');
          return;
        }

        if (session) {
          console.log('✅ OAuth successful, redirecting to dashboard');
          localStorage.setItem('session_source', 'oauth');
          navigate('/dashboard');
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#2b303a] flex items-center justify-center">
      <div className="text-white text-xl">Completing sign in...</div>
    </div>
  );
};

export default AuthCallback;