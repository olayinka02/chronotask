import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ snapshots: [] });
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  const { data, error } = await supabase
    .from('history_snapshots')
    .select('*')
    .eq('session_id', sessionId)
    .order('snapshot_index');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snapshots: data });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const { sessionId, snapshotIndex, tasksState, description } = await request.json();
  const { data, error } = await supabase
    .from('history_snapshots')
    .insert({
      session_id: sessionId,
      snapshot_index: snapshotIndex,
      tasks_state: tasksState,
      description,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snapshot: data }, { status: 201 });
}
