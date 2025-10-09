import React, {useState, useEffect} from 'react';
import logoTextImage from "../img/FoxTrail.png";
import logoImage from "../img/logo.png";
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { platform } from '@tauri-apps/plugin-os';
import { scan, Format, requestPermissions as requestCameraPermissions } from '@tauri-apps/plugin-barcode-scanner';
import { supabase } from '../lib/supabaseClient';

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError ] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();

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

  // Redirect if user is logged in (QR scan will handle auth automatically)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Redirect if user is already logged in
  if(user){
    return <Navigate to="/dashboard" replace/>
  }

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setLoading('permission');
      setError(null);

      console.log('📷 Requesting camera permission...');
      
      // Use the barcode scanner's permission system, similar to your notification pattern
      const permission = await requestCameraPermissions();
      const granted = permission === 'granted';
      
      setCameraPermission(granted);
      setLoading(null);
      
      if (!granted) {
        console.error('❌ CAMERA PERMISSION DENIED: User has not granted camera permissions');
        setError('Camera permission is required to scan QR codes. Please enable camera access in your device settings.');
      } else {
        console.log('✅ CAMERA PERMISSION GRANTED: User has granted camera permissions');
      }
      
      return granted;
    } catch (error) {
      console.error('❌ ERROR REQUESTING CAMERA PERMISSION:', error);
      setError('Failed to request camera permission. Please enable camera access in your device settings.');
      setLoading(null);
      return false;
    }
  };

  const handleQRScan = async (): Promise<void> => {
    try {
      setScanning(true);
      setError(null);
      setLoading('qr-scan');

      console.log('🚀 Starting QR scan process...');

      // First, explicitly request camera permission using the same pattern as notifications
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        throw new Error('Camera permission denied. Please enable camera access to scan QR codes.');
      }

      console.log('✅ Camera permission granted, starting scan...');

      // Now scan the QR code
      const result = await scan({
        formats: [Format.QRCode],
        windowed: false,
      });

      if (result.content) {
        console.log('📱 QR Code scanned:', result.content);
        
        // Parse QR code data
        const parsedData = JSON.parse(result.content);
        const { token } = parsedData;

        if (!token) {
          throw new Error('Invalid QR code format');
        }

        console.log('🔐 Validating QR session...');

        // Validate and retrieve auth data from the QR session
        const { data: qrSession, error: sessionError } = await supabase
          .from('qr_auth_sessions')
          .select('auth_token, desktop_user_id, expires_at, mobile_device_authenticated')
          .eq('session_token', token)
          .eq('mobile_device_authenticated', false)
          .single();

        if (sessionError || !qrSession) {
          throw new Error('Invalid or expired QR code');
        }

        // Check if session is expired
        if (new Date(qrSession.expires_at) < new Date()) {
          throw new Error('QR code has expired. Please generate a new one on desktop.');
        }

        console.log('✅ QR session valid, authenticating...');

        // Use the refresh token to create a NEW independent session on mobile
        const { data: authData, error: authError } = await supabase.auth.refreshSession({
          refresh_token: qrSession.auth_token
        });

        if (authError || !authData.session) {
          console.error('Auth error:', authError);
          throw new Error('Failed to create mobile session. The QR code may have expired.');
        }

        console.log('✅ Successfully created independent mobile session!');

        // Mark the QR session as used
        await supabase
          .from('qr_auth_sessions')
          .update({ 
            mobile_device_authenticated: true,
            used_at: new Date().toISOString()
          })
          .eq('session_token', token);

        console.log('✅ QR session marked as used');

        // Mark this session as coming from QR code for proper logout handling
        localStorage.setItem('session_source', 'qr_code');

        // Wait for auth state to propagate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Error scanning QR code:', err);
      
      // Check for specific error messages that indicate permission issues
      if (err.message?.includes('permission') || 
          err.message?.includes('camera') || 
          err.message?.includes('denied') ||
          err.message?.includes('NotAllowedError') ||
          err.message?.includes('PermissionDenied')) {
        setError('Camera permission is required to scan QR codes. Please enable camera access in your device settings and try again.');
      } else if (err.message?.includes('canceled') || err.message?.includes('dismissed')) {
        setError('Scan cancelled. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to scan QR code. Please try again.');
      }
    } finally {
      setScanning(false);
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading('google');
      setError(null);
      localStorage.setItem('session_source', 'oauth');
      await signInWithGoogle();
      setLoading(null);
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
      localStorage.setItem('session_source', 'oauth');
      await signInWithLinkedIn()
      setLoading(null);
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
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-4">
        {/* Fox Logo */}
        <img src={logoImage} alt="Logo" className='w-20 h-20 rounded-full border-none mt-12'/>
        
        {/* Tagline */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Never miss your<br />
            dream job.
          </h2>
        </div>

        {error && (
          <div className={`${
            error.includes('verified') ? 'bg-blue-100 border-blue-400 text-blue-700' : 
            error.includes('permission') || error.includes('camera') ? 'bg-yellow-100 border-yellow-400 text-yellow-700' :
            'bg-red-100 border-red-400 text-red-700'
          } border px-4 py-3 rounded max-w-sm w-full`}>
            {error}
            {error.includes('permission') && (
              <div className="mt-2">
                <button
                  onClick={requestCameraPermission}
                  className="text-sm underline hover:opacity-80"
                >
                  Request Camera Permission Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile: QR Scanner */}
        {isMobile ? (
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Scan to Login
              </h3>
              <p className="text-gray-400 text-sm">
                Scan the QR code from your desktop to login
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {cameraPermission === true 
                  ? '✅ Camera access granted' 
                  : '📷 Camera permission will be requested'}
              </p>
            </div>

            <button
              onClick={handleQRScan}
              disabled={scanning || loading === 'qr-scan' || loading === 'permission'}
              className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <span className="text-lg font-medium">
                {loading === 'permission' ? 'Requesting Camera Access...' : 
                 scanning || loading === 'qr-scan' ? 'Scanning...' : 'Scan QR Code'}
              </span>
            </button>

            {/* Or Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-[#d64933]"></div>
              <span className="px-2 text-[#d64933] font-medium text-lg">or login with</span>
              <div className="flex-1 h-px bg-[#d64933]"></div>
            </div>

          </div>
        ) : (
          // Desktop: Regular Login Buttons
          <div className="w-full max-w-sm space-y-4">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading === 'google'}
              className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50"
            >
              <div className="w-6 h-6 bg-transparent rounded-full flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z" fill="#4285F4"></path> <path d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z" fill="#34A853"></path> <path d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z" fill="#FBBC05"></path> <path d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z" fill="#EB4335"></path> </g></svg>
              </div>
              <span className="text-lg font-medium pt-2">
                {loading === 'google' ? 'Opening...' : 'Continue with Google'}
              </span>
            </button>

            {/* LinkedIn Login Button */}
            <button
              onClick={handleLinkedInSignIn}
              disabled={loading === 'linkedIn'}
              className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 bg-transparent rounded flex items-center justify-center">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="24" cy="24" r="20" fill="#0077B5"></circle> <path fillRule="evenodd" clipRule="evenodd" d="M18.7747 14.2839C18.7747 15.529 17.8267 16.5366 16.3442 16.5366C14.9194 16.5366 13.9713 15.529 14.0007 14.2839C13.9713 12.9783 14.9193 12 16.3726 12C17.8267 12 18.7463 12.9783 18.7747 14.2839ZM14.1199 32.8191V18.3162H18.6271V32.8181H14.1199V32.8191Z" fill="white"></path> <path fillRule="evenodd" clipRule="evenodd" d="M22.2393 22.9446C22.2393 21.1357 22.1797 19.5935 22.1201 18.3182H26.0351L26.2432 20.305H26.3322C26.9254 19.3854 28.4079 17.9927 30.8101 17.9927C33.7752 17.9927 35.9995 19.9502 35.9995 24.219V32.821H31.4922V24.7838C31.4922 22.9144 30.8404 21.6399 29.2093 21.6399C27.9633 21.6399 27.2224 22.4999 26.9263 23.3297C26.8071 23.6268 26.7484 24.0412 26.7484 24.4574V32.821H22.2411V22.9446H22.2393Z" fill="white"></path> </g></svg>
              </div>
              <span className="text-lg font-medium pt-2">
                {loading === 'linkedIn' ? 'Opening...' : 'Continue with LinkedIn'}
              </span>
            </button>

            {/* Or Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-[#d64933]"></div>
              <span className="px-2 text-[#d64933] font-medium text-lg">or</span>
              <div className="flex-1 h-px bg-[#d64933]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isMobile && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button className="text-5xl font-bold text-[#d64933] hover:text-orange-400 transition-colors pb-10">
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;