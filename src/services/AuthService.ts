// src/services/qrAuthService.ts
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export interface QRAuthSession {
  id: string;
  sessionToken: string;
  expiresAt: string;
}

export class QRAuthService {
  private static readonly SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
  private static activeSubscriptions: Map<string, any> = new Map();

  /**
   * Generate a QR code that contains authentication data
   * This creates a temporary session that mobile can use independently
   */
  static async generateQRSessionForTransfer(): Promise<{ 
    qrCodeDataUrl: string; 
    sessionToken: string;
    expiresAt: Date;
  }> {
    // Get current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No active session found. Please login first.');
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    // Instead of storing the refresh token directly, we'll store the user info
    // and let mobile create its own session via a magic link or similar
    // For now, we'll use a workaround: store the access token temporarily
    const { error } = await supabase
      .from('qr_auth_sessions')
      .insert({
        session_token: sessionToken,
        desktop_user_id: session.user.id,
        // Store the refresh token - mobile will use this to get its own independent session
        auth_token: session.refresh_token,
        expires_at: expiresAt.toISOString(),
        mobile_device_authenticated: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating QR session:', error);
      throw new Error('Failed to create QR session');
    }

    // QR code payload
    const qrPayload = {
      token: sessionToken,
      version: '1.0',
      timestamp: Date.now()
    };

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#2b303a',
        light: '#ffffff'
      }
    });

    return { 
      qrCodeDataUrl, 
      sessionToken,
      expiresAt
    };
  }

  /**
   * Validate and retrieve auth data from QR session token
   * This is called by mobile after scanning
   */
  static async validateAndRetrieveSession(sessionToken: string): Promise<{
    authToken: string;
    userId: string;
  }> {
    const { data, error } = await supabase
      .from('qr_auth_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('mobile_device_authenticated', false)
      .single();

    if (error || !data) {
      throw new Error('Invalid or expired QR code');
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('QR code has expired');
    }

    // Mark as used
    await supabase
      .from('qr_auth_sessions')
      .update({ 
        mobile_device_authenticated: true,
        used_at: new Date().toISOString()
      })
      .eq('session_token', sessionToken);

    return {
      authToken: data.auth_token,
      userId: data.desktop_user_id
    };
  }

  /**
   * Clean up expired sessions for current user
   */
  static async cleanupExpiredSessions(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('qr_auth_sessions')
      .delete()
      .eq('desktop_user_id', session.user.id)
      .lt('expires_at', new Date().toISOString());
  }

  /**
   * Subscribe to session usage events
   * Optional: Desktop can be notified when mobile successfully logs in
   */
  static subscribeToSessionUsage(
    sessionToken: string,
    onUsed: () => void
  ): () => void {
    // Remove any existing subscription for this session token
    this.unsubscribeFromSessionUsage(sessionToken);

    const channel = supabase
      .channel(`qr-session-${sessionToken}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qr_auth_sessions',
          filter: `session_token=eq.${sessionToken}`
        },
        (payload: any) => {
          if (payload.new.mobile_device_authenticated === true) {
            onUsed();
            // Auto-unsubscribe after successful usage
            this.unsubscribeFromSessionUsage(sessionToken);
          }
        }
      )
      .subscribe();

    // Store the channel for potential manual unsubscription
    this.activeSubscriptions.set(sessionToken, channel);

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromSessionUsage(sessionToken);
    };
  }

  /**
   * Unsubscribe from session usage events
   */
  static unsubscribeFromSessionUsage(sessionToken: string): void {
    const channel = this.activeSubscriptions.get(sessionToken);
    if (channel) {
      supabase.removeChannel(channel);
      this.activeSubscriptions.delete(sessionToken);
      console.log(`Unsubscribed from session: ${sessionToken}`);
    }
  }

  /**
   * Clean up all active subscriptions
   */
  static cleanupAllSubscriptions(): void {
    for (const [sessionToken, channel] of this.activeSubscriptions.entries()) {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from session: ${sessionToken}`);
    }
    this.activeSubscriptions.clear();
  }
}