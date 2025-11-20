import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function GET() {
  console.log('=== FIREBASE CONNECTION TEST ===');
  
  try {
    // Test direct initialization
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log('Environment check:', {
      projectId: projectId ? `✅ (${projectId})` : '❌ MISSING',
      clientEmail: clientEmail ? `✅ (${clientEmail})` : '❌ MISSING',
      privateKey: privateKey ? `✅ (${privateKey.length} chars)` : '❌ MISSING',
    });

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing environment variables');
    }

    // Clean the private key
    const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n');
    console.log('Cleaned private key starts with:', cleanedPrivateKey.substring(0, 50));

    // Create a test app
    const testApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: cleanedPrivateKey,
      }),
    }, 'connection-test');

    console.log('✅ Firebase Admin app created');

    // Test authentication
    const auth = getAuth(testApp);
    const users = await auth.listUsers(1);
    console.log('✅ Firebase Auth connection successful - can list users');

    // Test creating a user
    const testEmail = `test-${Date.now()}@test.com`;
    const userRecord = await auth.createUser({
      email: testEmail,
      password: 'testpassword123',
      emailVerified: false,
      disabled: false,
    });

    console.log('✅ Test user created:', userRecord.uid);

    // Clean up - delete test user
    await auth.deleteUser(userRecord.uid);
    console.log('✅ Test user cleaned up');

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Firebase Admin is working correctly!',
      test: {
        appCreated: true,
        authConnected: true,
        userCreated: true,
        userDeleted: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Connection test FAILED:', error);
    
    const errorInfo = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : 'Unknown error';

    return NextResponse.json({
      status: 'FAILED',
      error: errorInfo,
      help: 'Check your Firebase service account credentials and project configuration',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}