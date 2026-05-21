import { NextResponse } from 'next/server';
import { incrementFrameworkViews } from '@/lib/db/frameworks';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing framework id.' }, { status: 400 });
    }

    const views = await incrementFrameworkViews(id.trim());
    if (views === null) {
      return NextResponse.json({ error: 'Failed to increment.' }, { status: 500 });
    }

    return NextResponse.json({ views });
  } catch (err) {
    console.error('View increment error:', err);
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}
