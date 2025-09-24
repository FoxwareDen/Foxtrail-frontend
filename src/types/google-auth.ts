// src/types/google-auth.ts

export interface GoogleAuthResponse {
  idToken: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
  email?: string
  name?: string
  picture?: string
}

export interface GoogleSignInOptions {
  clientId: string
  scopes: string[]
  hostedDomain?: string
  loginHint?: string
  redirectUri?: string
  successHtmlResponse?: string
}

export interface GoogleSignOutOptions {
  accessToken?: string
}

// Type guard to check if Google auth response is valid
export const isValidGoogleAuthResponse = (response: any): response is GoogleAuthResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.idToken === 'string' &&
    typeof response.accessToken === 'string' &&
    typeof response.expiresAt === 'number'
  )
}