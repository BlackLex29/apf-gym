import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== FIREBASE ADMIN DEBUG ===');
  
  // Check environment variables (don't log full private key for security)
  const envStatus = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing', 
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `✅ Set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '❌ Missing',
  };

  console.log('Environment Variables:', envStatus);

  // Try to import and check Firebase Admin
  try {
    const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
    
    const adminStatus = {
      adminAuth: adminAuth ? '✅ Initialized' : '❌ Not initialized',
      adminDb: adminDb ? '✅ Initialized' : '❌ Not initialized',
    };

    console.log('Firebase Admin Status:', adminStatus);

    return NextResponse.json({
      environment: envStatus,
      firebaseAdmin: adminStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking Firebase Admin:', error);
    return NextResponse.json({
      error: 'Failed to check Firebase Admin',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: envStatus,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}