// src/components/QRCodeDisplay.tsx
import React, { useState, useEffect } from 'react';
import { QRAuthService } from '../services/AuthService';

interface QRCodeDisplayProps {
  onMobileAuthenticated?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ onMobileAuthenticated }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [mobileScanned, setMobileScanned] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setMobileScanned(false);
      
      // Clean up old sessions
      await QRAuthService.cleanupExpiredSessions();
      
      // Generate new QR code with auth data
      const { qrCodeDataUrl, sessionToken: token, expiresAt } = 
        await QRAuthService.generateQRSessionForTransfer();
      
      setQrCodeUrl(qrCodeDataUrl);
      setSessionToken(token);
      setTimeRemaining(300); // Reset timer
      
      console.log('QR Code generated successfully');
      console.log('Expires at:', expiresAt);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to generate QR code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial generation
  useEffect(() => {
    generateQRCode();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || mobileScanned) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          generateQRCode(); // Auto-refresh when expired
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, mobileScanned]);

  // Listen for mobile device authentication
  useEffect(() => {
    if (!sessionToken) return;

    const unsubscribe = QRAuthService.subscribeToSessionUsage(
      sessionToken,
      () => {
        console.log('Mobile device successfully authenticated!');
        setMobileScanned(true);
        onMobileAuthenticated?.();
      }
    );

    return unsubscribe;
  }, [sessionToken, onMobileAuthenticated]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Login on Mobile
        </h3>
        <p className="text-gray-400 text-sm max-w-md">
          Scan this QR code with the FoxTrail mobile app to instantly log in on your phone
        </p>
      </div>

      {loading ? (
        <div className="w-[300px] h-[300px] bg-gray-700/50 rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92dce5]"></div>
            <p className="text-gray-400 text-sm">Generating QR code...</p>
          </div>
        </div>
      ) : error ? (
        <div className="w-[300px] min-h-[300px] bg-red-900/20 border-2 border-red-500 rounded-xl flex flex-col items-center justify-center p-6">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-500 text-center mb-4">{error}</p>
          <button
            onClick={generateQRCode}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            {/* QR Code */}
            <div className={`bg-white p-4 rounded-xl shadow-2xl transition-all duration-300 ${
              mobileScanned ? 'opacity-50' : ''
            }`}>
              <img 
                src={qrCodeUrl} 
                alt="QR Code for Mobile Login" 
                className="w-[300px] h-[300px]"
              />
            </div>
            
            {/* Success Overlay */}
            {mobileScanned && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-xl">
                <div className="text-center text-white">
                  <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xl font-bold">Scanned!</p>
                  <p className="text-sm">Mobile login successful</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Timer and Actions */}
          {!mobileScanned && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center px-4 py-2 bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Expires in</p>
                <p className="text-2xl font-mono text-white font-bold">
                  {formatTime(timeRemaining)}
                </p>
              </div>
              
              <button
                onClick={generateQRCode}
                disabled={loading}
                className="px-6 py-2 bg-[#92dce5] text-[#2b303a] rounded-lg hover:bg-[#7cc9d1] transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Code</span>
              </button>
            </div>
          )}

          {mobileScanned && (
            <button
              onClick={generateQRCode}
              className="px-6 py-3 bg-[#D64933] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Generate New Code
            </button>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="bg-gray-700/30 rounded-lg p-4 max-w-md">
        <h4 className="text-sm font-semibold text-white mb-2">How to use:</h4>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Open the FoxTrail app on your mobile device</li>
          <li>Tap "Scan QR Code" on the login screen</li>
          <li>Point your camera at this QR code</li>
          <li>You'll be automatically logged in!</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeDisplay;