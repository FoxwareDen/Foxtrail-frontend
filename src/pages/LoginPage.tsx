import React, { useState, useEffect } from 'react';
import logoTextImage from "../../public/FoxTrail.png";
import logoImage from "../../public/logo.png";
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { listen } from '@tauri-apps/api/event';
import { cancelScan, getScanPerm, isScanning, startScan } from '../lib/qrCodeScanner';
import { getPlatform } from '../lib/utils';

const LoginPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);

  const { user, signInWithGoogle, signInWithGoogleSDK } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const LINKEDIN_OAUTH_URL = `https://fvlsvvzbywmozvhwxmzl.supabase.co/auth/v1/authorize?provider=linkedin_oidc&redirect_to=${encodeURIComponent('com.fox5352.foxtrail://auth/callback')}`;

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const platformName = getPlatform();
        setIsMobile(platformName === 'android' || platformName === 'ios');
      } catch (error) {
        console.error('Platform detection failed:', error);
        setIsMobile(false);
      }
    };
    checkPlatform();
  }, []);

  // Update scanning state using the isScanning global state
  useEffect(() => {
    setScanning(isScanning);
  }, [isScanning])

  useEffect(() => {
    if (!isMobile) return;

    let unlisten: (() => void) | undefined;
    const setupListener = async () => {
      try {
        unlisten = await listen('deep-link', async (event) => {
          const url = event.payload as string;
          if (url.includes('com.fox5352.foxtrail://auth/callback')) {
            setLoading('processing');
            try {
              const urlObj = new URL(url.replace('com.fox5352.foxtrail://', 'https://dummy.com/'));
              const fragment = urlObj.hash.substring(1);
              const params = new URLSearchParams(fragment);

              if (params.has('error')) {
                setError(params.get('error_description') || params.get('error') || 'OAuth failed');
                return;
              }

              const accessToken = params.get('access_token');
              if (accessToken) window.location.href = '/dashboard';
              else setError('No access token received');
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
    return () => { if (unlisten) unlisten(); };
  }, [isMobile]);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading('google');
      setError(null);
      if (isMobile) await signInWithGoogleSDK();
      else await signInWithGoogle();
      setLoading(null);
    } catch (error) {
      console.error('Login error:', error);
      setError('Error signing in with Google.');
      setLoading(null);
    }
  };

  const handleLinkedInSignIn = async (): Promise<void> => {
    try {
      const result = await getScanPerm();
      if (!result) return;

      const scanData = await startScan();

      console.log("Scan result:", scanData);
    } catch (err) {
      console.error("QR scan failed", err);
    }
  };

  const handleCancelScan = async () => {
    cancelScan();
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-[#2b303a] flex flex-col justify-between relative">
      {scanning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-50">
          {/* TODO: this is the camrea window component */}
          <div id="scanner-video" className="w-64 h-64 border-4 border-white rounded-lg" />
          {/* FIX:Camera container */}
          <button onClick={handleCancelScan} className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg text-lg">
            Cancel Scan
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex-1 flex items-start">
        <img src={logoTextImage} alt="LogoText" className="w-40 h-12 py-2 px-4 ml-6 mt-4" />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <img src={logoImage} alt="Logo" className='w-20 h-20 rounded-full border-none mt-12' />
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Never miss your<br />dream job.
          </h2>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {loading === 'processing' && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">Processing OAuth response...</div>}

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button onClick={handleGoogleSignIn} disabled={loading === 'google' || loading === 'processing'}
            className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50">
            Continue with Google
          </button>

          <button onClick={handleLinkedInSignIn} className="w-full bg-transparent border-2 border-[#92dce5] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-[#92dce5] hover:bg-opacity-10 transition-colors disabled:opacity-50">
            Continue with LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
