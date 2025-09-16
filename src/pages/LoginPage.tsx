import React, {useState, useEffect} from 'react';
import logoTextImage from "../../public/FoxTrail.png";
import logoImage from "../../public/logo.png";
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { platform } from '@tauri-apps/plugin-os';
import { openUrl as open } from '@tauri-apps/plugin-opener';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithLinkedIn} = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError ] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Hardcode your OAuth URLs (replace with your actual values)  
  const LINKEDIN_OAUTH_URL = `https://fvlsvvzbywmozvhwxmzl.supabase.co/auth/v1/authorize?provider=linkedin_oidc&redirect_to=${encodeURIComponent('com.fox5352.foxtrail-frontend://auth/callback')}`;

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const platformName = await platform(); 
        setIsMobile(platformName === 'android' || platformName === 'ios');
      } catch (error) {
        console.error('Platform detection failed:', error);
        setIsMobile(false);
      }
    };
    checkPlatform();
  }, []);

  // Set up OAuth callback listener for mobile
  useEffect(() => {
    if (!isMobile) return;

    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        // Listen for deep link events
        unlisten = await listen('deep-link', async (event) => {
          console.log('Deep link received:', event.payload);
          
          const url = event.payload as string;
          console.log('Processing OAuth callback URL:', url);
          
          if (url.includes('com.fox5352.foxtrail-frontend://auth/callback')) {
            setLoading('processing');
            
            try {
              // Extract the URL parameters
              const urlObj = new URL(url.replace('com.fox5352.foxtrail-frontend://', 'https://dummy.com/'));
              const fragment = urlObj.hash.substring(1); // Remove the # symbol
              const params = new URLSearchParams(fragment);
              
              // Check for error
              if (params.has('error')) {
                const errorMsg = params.get('error_description') || params.get('error') || 'OAuth authentication failed';
                setError(errorMsg);
                console.error('OAuth error:', errorMsg);
                return;
              }
              
              // Check for success - Supabase typically returns access_token in the fragment
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('OAuth success, tokens received');
                // Here you would typically store the tokens and update your auth context
                // For now, we'll just log success and redirect
                
                // You might want to call your auth context method to handle the tokens
                // await handleOAuthTokens(accessToken, refreshToken);
                
                // Redirect to dashboard or handle success
                window.location.href = '/dashboard';
              } else {
                setError('No access token received from OAuth provider');
              }
            } catch (err) {
              console.error('Error processing OAuth callback:', err);
              setError('Failed to process OAuth response');
            } finally {
              setLoading(null);
            }
          }
        });
      } catch (err) {
        console.error('Failed to set up OAuth listener:', err);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [isMobile]);

  //Redirect if user is already logged in
  if(user){
    return <Navigate to="/dashboard" replace/>
  }

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading('google');
      setError(null);
      
      if (isMobile) {
        // Use your app's custom URL scheme for deep linking
        const redirectUri = encodeURIComponent('com.fox5352.foxtrail-frontend://auth/callback');
        const GOOGLE_OAUTH_URL = `https://fvlsvvzbywmozvhwxmzl.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectUri}`;
        
        console.log('Opening mobile OAuth URL:', GOOGLE_OAUTH_URL);
        await open(GOOGLE_OAUTH_URL);
        
        // Don't set loading to null here - let the callback handler do it
      } else {
        await signInWithGoogle();
        setLoading(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error signing in with Google. Please try again.');
      setLoading(null);
    }
  };

  const handleLinkedInSignIn = async (): Promise<void> =>{
    try{
      setLoading('linkedIn')
      setError(null)
      if (isMobile) {
        await open(LINKEDIN_OAUTH_URL);
        // Don't set loading to null here - let the callback handler do it
      } else {
        await signInWithLinkedIn() // Keep this for web
        setLoading(null);
      }
    }catch(error){
      console.error('Login error:', error)
      setError('Error signing in with LinkedIn. Please try again.')
      setLoading(null);
    }
  }
  
  return (
    <div className="min-h-screen bg-[#2b303a] flex flex-col justify-between">
      {/* Header with Logo */}
      <div className="flex-1 flex items-start">
        <img src={logoTextImage} alt="LogoText" className= "w-40 h-12 py-2 px-4 ml-6 mt-4"></img>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Fox Logo Placeholder */}
        <img src={logoImage} alt="Logo" className='w-20 h-20 rounded-full border-none mt-12'/>
        {/* Tagline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Never miss your<br />
            dream job.
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading === 'processing' && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Processing OAuth response...
          </div>
        )}

        {/* Login Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {/* Google Login Button */}
          <button 
          onClick={handleGoogleSignIn}
          disabled={loading === 'google' || loading === 'processing'}
          className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50">
            <><div className="w-6 h-6 bg-transparent rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z" fill="#4285F4"></path> <path d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z" fill="#34A853"></path> <path d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z" fill="#FBBC05"></path> <path d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z" fill="#EB4335"></path> </g></svg>
                </div><span className="text-lg font-medium pt-2">
                  {loading === 'google' ? 'Opening...' : loading === 'processing' ? 'Processing...' : 'Continue with Google'}
                </span></>
          </button>

          {/* LinkedIn Login Button */}
          <button
           onClick={handleLinkedInSignIn}
           disabled={loading === 'linkedIn' || loading === 'processing'}
           className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50">
            <div className="w-8 h-8 bg-transparent rounded flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="24" cy="24" r="20" fill="#0077B5"></circle> <path fillRule="evenodd" clipRule="evenodd" d="M18.7747 14.2839C18.7747 15.529 17.8267 16.5366 16.3442 16.5366C14.9194 16.5366 13.9713 15.529 14.0007 14.2839C13.9713 12.9783 14.9193 12 16.3726 12C17.8267 12 18.7463 12.9783 18.7747 14.2839ZM14.1199 32.8191V18.3162H18.6271V32.8181H14.1199V32.8191Z" fill="white"></path> <path fillRule="evenodd" clipRule="evenodd" d="M22.2393 22.9446C22.2393 21.1357 22.1797 19.5935 22.1201 18.3182H26.0351L26.2432 20.305H26.3322C26.9254 19.3854 28.4079 17.9927 30.8101 17.9927C33.7752 17.9927 35.9995 19.9502 35.9995 24.219V32.821H31.4922V24.7838C31.4922 22.9144 30.8404 21.6399 29.2093 21.6399C27.9633 21.6399 27.2224 22.4999 26.9263 23.3297C26.8071 23.6268 26.7484 24.0412 26.7484 24.4574V32.821H22.2411V22.9446H22.2393Z" fill="white"></path> </g></svg>
            </div>
            <span className="text-lg font-medium pt-2">
              {loading === 'linkedIn' ? 'Opening...' : loading === 'processing' ? 'Processing...' : 'Continue with LinkedIn'}
            </span>
          </button>
        </div>

        {/* Or Divider */}
        <div className="flex items-center w-full max-w-sm my-6">
          <div className="flex-1 h-px bg-[#d64933]"></div>
          <span className="px-2 text-[#d64933] font-medium text-lg">or</span>
          <div className="flex-1 h-px bg-[#d64933]"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <button className="text-5xl font-bold text-[#d64933] hover:text-orange-400 transition-colors pb-10">
          Log in
        </button>
      </div>
    </div>
  );
};

export default LoginPage;