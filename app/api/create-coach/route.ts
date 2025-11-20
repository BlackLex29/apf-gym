// app/api/create-coach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(request: NextRequest) {
  try {
    console.log('🟢 API Route: Received POST request to /api/create-coach');

    // 1. Verify the request is from an authenticated admin
    const authHeader = request.headers.get('Authorization');
    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No authorization token provided');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('🔓 Verifying token...');
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('✅ Token verified for user:', decodedToken.uid);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // 2. Check if user is admin
    console.log('👤 Checking admin role...');
    const adminDoc = await adminDb.collection('users').where('authUid', '==', decodedToken.uid).limit(1).get();
    
    if (adminDoc.empty) {
      console.error('❌ User document not found');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 403 }
      );
    }

    const adminData = adminDoc.docs[0].data();
    console.log('👤 User role:', adminData.role);
    
    if (!adminData || adminData.role !== 'admin') {
      console.error('❌ User is not an admin');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Get coach data from request
    console.log('📥 Parsing request body...');
    const body = await request.json();
    const { name, email, password, phone, specialty, experience, status } = body;
    
    console.log('📝 Coach data received:', { name, email, phone, specialty, experience, status });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // 4. Create the coach user in Firebase Auth
    console.log('🔨 Creating Firebase Auth user...');
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        disabled: status === 'inactive',
      });
      console.log('✅ Firebase Auth user created:', userRecord.uid);
    } catch (error) {
      console.error('❌ Error creating Auth user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create auth user';
      return NextResponse.json(
        { error: `Auth creation failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // 5. Add coach data to Firestore
    console.log('💾 Adding coach to Firestore...');
    const coachData = {
      name,
      email,
      phone,
      specialty,
      experience,
      status: status || 'active',
      role: 'coach',
      authUid: userRecord.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminDb.collection('users').add(coachData);
      console.log('✅ Coach added to Firestore');
    } catch (error) {
      console.error('❌ Error adding to Firestore:', error);
      // Rollback: delete the auth user if Firestore fails
      try {
        await adminAuth.deleteUser(userRecord.uid);
        console.log('🔄 Rolled back Auth user creation');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
      return NextResponse.json(
        { error: 'Failed to save coach data' },
        { status: 500 }
      );
    }

    // 6. Return success
    console.log('🎉 Coach created successfully!');
    return NextResponse.json({
      success: true,
      message: 'Coach created successfully',
      coachId: userRecord.uid,
    });

  } catch (error) {
    console.error('💥 Unexpected error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create coach';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}