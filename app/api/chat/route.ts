import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful gym assistant for GymSchedPro. Help users with:

OPERATING HOURS:
- Gym hours: 5 AM - 10 PM daily (Monday to Sunday)

PRICING (in Philippine Pesos):
- Monthly Membership (Regular): ₱1,000
- Monthly Membership (Student): ₱1,000
- Walk-in Rate (Regular): ₱100
- Walk-in Rate (Student): ₱80

STUDIO CLASSES:
- Available classes: Zumba, Yoga, Boxing, Dance, HIIT, Pilates, Spin
- Class duration: 45-60 minutes per session
- Booking requirement: 2 hours advance booking
- Cancellation policy: Cancel at least 1 hour in advance

AVAILABLE COACHES:
- Eugene Dalida (also known as "Chingchong")
- Coach Brix
- Coach Grey
- Coach Paul

GYM FACILITIES & AMENITIES:
- Cardio machines
- Free weights
- Strength training equipment
- Functional training area
- Locker rooms
- Showers
- Towel service
- Water station

IMPORTANT RULES:
- Proper athletic attire required
- Wipe down equipment after use
- Return weights to proper storage
- No food in workout areas (water bottles only)
- Respect personal space and time limits on busy equipment

Be friendly, concise, and helpful. Always use Philippine Peso (₱) when mentioning prices.`,
                },
                ...messages,
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        return NextResponse.json({
            message: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        });
    } catch (error) {
        console.error('Groq API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}