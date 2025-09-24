// src/config/auth.ts

export const AUTH_CONFIG = {
  google: {
    // IMPORTANT: This should be your ANDROID Client ID from Google Cloud Console
    // Format: "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
    androidClientId: '907833402967-9binbctnfsg0n66ulr2jopq1t2rsneqo.apps.googleusercontent.com',
    
    // This is your WEB Client ID (used by Supabase)
    webClientId: '907833402967-cdtn11v6gpoa83avk45r9rbb8poimqt1.apps.googleusercontent.com',
    
    scopes: ['openid', 'email', 'profile']
  },
  supabase: {
    url: 'https://fvlsvvzbywmozvhwxmzl.supabase.co',
    redirectUri: 'com.fox5352.foxtrail://auth/callback'
  }
}

// Debug function to verify configuration
export const debugAuthConfig = () => {
  console.log('=== AUTH CONFIG DEBUG ===')
  console.log('Android Client ID set:', !AUTH_CONFIG.google.androidClientId.includes('YOUR_'))
  console.log('Web Client ID set:', !AUTH_CONFIG.google.webClientId.includes('YOUR_'))
  console.log('Package name:', 'com.fox5352.foxtrail')
  console.log('=== END DEBUG ===')
}