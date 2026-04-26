import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing framework id.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('increment_views', { framework_id: id });

    if (error) {
      console.error('View increment error:', error);
      return NextResponse.json({ error: 'Failed to increment.' }, { status: 500 });
    }

    return NextResponse.json({ views: data });
  } catch (err) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}
