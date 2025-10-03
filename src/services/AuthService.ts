// src/services/AuthService.ts
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export interface QRAuthSession {
  desktop_user_id: string;
  session_token: string;
  auth_token: string;
  expires_at: string;
  mobile_device_authenticated: boolean;
  created_at: string;
  used_at: string | null;
}

export class QRAuthService {
  private static readonly SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
  private static activeSubscriptions: Map<string, any> = new Map();

  /**
   * Generate a QR code that contains authentication data
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

    try {
      // Try INSERT first
      const { error: insertError } = await supabase
        .from('qr_auth_sessions')
        .insert({
          desktop_user_id: session.user.id,
          session_token: sessionToken,
          auth_token: session.refresh_token,
          expires_at: expiresAt.toISOString(),
          mobile_device_authenticated: false,
          used_at: null,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // If insert fails (likely due to duplicate desktop_user_id), try UPDATE
        if (insertError.code === '23505') { // Unique violation
          const { error: updateError } = await supabase
            .from('qr_auth_sessions')
            .update({
              session_token: sessionToken,
              auth_token: session.refresh_token,
              expires_at: expiresAt.toISOString(),
              mobile_device_authenticated: false,
              used_at: null
            })
            .eq('desktop_user_id', session.user.id);

          if (updateError) {
            console.error('Error updating QR session:', updateError);
            throw new Error('Failed to update QR session');
          }
        } else {
          // Some other insert error
          console.error('Error creating QR session:', insertError);
          throw new Error('Failed to create QR session');
        }
      }
    } catch (err) {
      console.error('Error in generateQRSessionForTransfer:', err);
      throw new Error('Failed to generate QR session');
    }

    // Generate QR code
    const qrPayload = {
      token: sessionToken,
      version: '1.0',
      timestamp: Date.now()
    };

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
    const { error: updateError } = await supabase
      .from('qr_auth_sessions')
      .update({ 
        mobile_device_authenticated: true,
        used_at: new Date().toISOString()
      })
      .eq('desktop_user_id', data.desktop_user_id);

    if (updateError) {
      console.error('Error updating session as used:', updateError);
      throw new Error('Failed to validate session');
    }

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
   * Get the current active session for user (if any)
   */
  static async getCurrentSession(userId: string): Promise<QRAuthSession | null> {
    const { data, error } = await supabase
      .from('qr_auth_sessions')
      .select('*')
      .eq('desktop_user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Check if user has an active, unused session
   */
  static async hasActiveSession(userId: string): Promise<boolean> {
    const session = await this.getCurrentSession(userId);
    if (!session) return false;

    return !session.mobile_device_authenticated && 
           new Date(session.expires_at) > new Date();
  }

  /**
   * Invalidate current session for user
   */
  static async invalidateSession(userId: string): Promise<void> {
    await supabase
      .from('qr_auth_sessions')
      .delete()
      .eq('desktop_user_id', userId);
  }

  /**
   * Refresh session - generate new token and extend expiry
   */
  static async refreshSession(): Promise<{ 
    sessionToken: string;
    expiresAt: Date;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    // Try INSERT first, then UPDATE if conflict
    const { error: insertError } = await supabase
      .from('qr_auth_sessions')
      .insert({
        desktop_user_id: session.user.id,
        session_token: sessionToken,
        auth_token: session.refresh_token,
        expires_at: expiresAt.toISOString(),
        mobile_device_authenticated: false,
        used_at: null,
        created_at: new Date().toISOString()
      });

    if (insertError && insertError.code === '23505') {
      // If insert fails due to duplicate, try UPDATE
      const { error: updateError } = await supabase
        .from('qr_auth_sessions')
        .update({
          session_token: sessionToken,
          auth_token: session.refresh_token,
          expires_at: expiresAt.toISOString(),
          mobile_device_authenticated: false,
          used_at: null
        })
        .eq('desktop_user_id', session.user.id);

      if (updateError) {
        throw new Error('Failed to refresh QR session');
      }
    } else if (insertError) {
      throw new Error('Failed to refresh QR session');
    }

    return { sessionToken, expiresAt };
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