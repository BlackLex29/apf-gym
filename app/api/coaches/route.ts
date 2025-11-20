import { NextResponse } from 'next/server';
import { getUsersFromFirestore } from '@/lib/firestoreService';

export async function GET() {
  try {
    const users = await getUsersFromFirestore();
    
    // Filter only coaches and transform to the required format
    const coaches = users
      .filter(user => user.role === 'coach' && user.status === 'active')
      .map(user => ({
        id: user.coachId || user.id,
        name: user.name,
        email: user.email,
        specialization: user.specialty || 'General Fitness',
        yearsExperience: parseInt(user.experience?.match(/\d+/)?.[0] || '1'),
        status: user.status as "active" | "pending" | "inactive",
        phone: user.phone,
        hourlyRate: 500, // Default rate, you can adjust this
        achievements: [
          `${user.experience || 'Certified'} Professional`,
          `${user.specialty || 'Fitness'} Specialist`
        ],
        image: getCoachImage(user.specialty)
      }));

    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

// Helper function to determine coach image based on specialty
function getCoachImage(specialty?: string): string {
  if (!specialty) return '/images/coaches/personal-trainer.jpg';
  
  const specialization = specialty.toLowerCase();
  if (specialization.includes('boxing') || specialization.includes('mma') || specialization.includes('karate')) {
    return '/images/coaches/combat.jpg';
  } else if (specialization.includes('yoga') || specialization.includes('pilates')) {
    return '/images/coaches/yoga.jpg';
  } else if (specialization.includes('dance') || specialization.includes('zumba')) {
    return '/images/coaches/dance.jpg';
  } else if (specialization.includes('rehabilitation')) {
    return '/images/coaches/rehab.jpg';
  } else {
    return '/images/coaches/personal-trainer.jpg';
  }
}