import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== COMPREHENSIVE FIREBASE DEBUG ===');
  
  // Check all environment variables in detail
  const envDetails = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'NOT_SET',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY 
      ? `SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars, starts with: ${process.env.FIREBASE_PRIVATE_KEY.substring(0, 30)}...)`
      : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log('Environment Details:', envDetails);

  // Try to initialize Firebase Admin manually to see the exact error
  try {
    const { initializeApp, cert } = await import('firebase-admin/app');
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Test initialization
    const testApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    }, 'test-app');

    console.log('✅ Manual Firebase Admin initialization SUCCESSFUL');
    
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth(testApp);
    
    // Try a simple operation
    await auth.listUsers(1);
    console.log('✅ Firebase Auth connection test SUCCESSFUL');

    return NextResponse.json({
      status: 'SUCCESS',
      environment: {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      firebase: 'Connected successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Manual Firebase Admin initialization FAILED:', error);
    
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : 'Unknown error';

    return NextResponse.json({
      status: 'FAILED',
      environment: {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      error: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}