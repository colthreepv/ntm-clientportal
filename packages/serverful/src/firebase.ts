import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { env } from './config.js'
import { createException } from './exception.js'

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY,
}

const firebaseAdminApp = initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAdminAuth = getAuth(firebaseAdminApp)

const ErrorVerifyingSessionCookie = createException('Error verifying session cookie', 'FIREBASE_01')
const NoSessionCookieFound = createException('Unauthorized: No session cookie found', 'FIREBASE_02')

export async function validateSession(c: Context, checkRevoked = false): Promise<DecodedIdToken> {
  const sessionCookie = getCookie(c, 'session')

  if (sessionCookie == null)
    throw new NoSessionCookieFound()

  try {
    return await firebaseAdminAuth.verifySessionCookie(sessionCookie, checkRevoked)
  }
  catch (error) {
    console.error('Error verifying session cookie:', error)
    throw new ErrorVerifyingSessionCookie({ cause: error })
  }
}
