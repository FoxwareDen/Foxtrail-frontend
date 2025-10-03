// src/components/QRCodeDisplay.tsx
import React, { useState, useEffect } from 'react';
import { QRAuthService } from '../services/AuthService';

interface QRCodeDisplayProps {
  onMobileAuthenticated?: () => void;
  onClose?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  onMobileAuthenticated, 
  onClose 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [mobileScanned, setMobileScanned] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setMobileScanned(false);
      setQrCodeUrl(null);
      
      const { qrCodeDataUrl, sessionToken: token } = 
        await QRAuthService.generateQRSessionForTransfer();
      
      setQrCodeUrl(qrCodeDataUrl);
      setSessionToken(token);
      setTimeRemaining(300);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code.';
      setError(errorMessage);
      setQrCodeUrl(null);
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (sessionToken) {
      QRAuthService.unsubscribeFromSessionUsage(sessionToken);
    }
    onClose?.();
  };

  useEffect(() => { 
    generateQRCode(); 
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      // Auto-refresh when timer reaches 0
      if (!mobileScanned) {
        generateQRCode();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, mobileScanned]);

  useEffect(() => {
    if (!sessionToken) return;

    const unsubscribe = QRAuthService.subscribeToSessionUsage(sessionToken, () => {
      setMobileScanned(true);
      onMobileAuthenticated?.();
    });

    return unsubscribe;
  }, [sessionToken, onMobileAuthenticated]);

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 relative text-sm">
      {onClose && (
        <button 
          onClick={handleClose} 
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">Login on Mobile</h3>
        <p className="text-gray-400 text-xs">Scan this QR code with the FoxTrail mobile app</p>
      </div>

      {loading ? (
        <div className="w-[200px] h-[200px] bg-gray-700/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92dce5]"></div>
        </div>
      ) : error ? (
        <div className="w-[200px] h-[200px] bg-red-900/20 border border-red-500 rounded-lg flex flex-col items-center justify-center p-3">
          <p className="text-red-400 text-center text-xs mb-2">{error}</p>
          <button 
            onClick={generateQRCode} 
            className="px-4 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      ) : qrCodeUrl ? (
        <div className="relative">
          <div className={`bg-white p-2 rounded-lg ${mobileScanned ? 'opacity-50' : ''}`}>
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-[200px] h-[200px]" 
            />
          </div>
          {mobileScanned && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-lg">
              <p className="text-white text-sm font-semibold">Scanned!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-[200px] h-[200px] bg-gray-700/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400 text-xs text-center">No QR code generated</p>
        </div>
      )}

      {!mobileScanned && !error && qrCodeUrl && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400 text-xs">Expires in {formatTime(timeRemaining)}</p>
          <button 
            onClick={generateQRCode} 
            disabled={loading} 
            className="px-4 py-1.5 bg-[#92dce5] text-[#2b303a] rounded text-xs disabled:opacity-50 hover:bg-[#7bc4cc]"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      {mobileScanned && (
        <div className="bg-green-500/20 border border-green-500 rounded p-2 max-w-xs">
          <p className="text-green-400 text-xs text-center">
            Mobile device authenticated successfully!
          </p>
        </div>
      )}

      <div className="bg-gray-700/30 rounded p-2 max-w-xs">
        <h4 className="text-white text-xs font-semibold">How to use:</h4>
        <ol className="text-gray-400 text-xs list-decimal ml-4">
          <li>Open FoxTrail app</li>
          <li>Tap "Scan QR"</li>
          <li>Point at this code</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeDisplay;