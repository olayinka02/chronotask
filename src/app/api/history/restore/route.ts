import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const { sessionId, snapshotIndex } = await request.json();
  const { data, error } = await supabase
    .from('history_snapshots')
    .select('*')
    .eq('session_id', sessionId)
    .eq('snapshot_index', snapshotIndex)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ snapshot: data });
}
