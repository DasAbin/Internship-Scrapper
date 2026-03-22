import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    if (Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
