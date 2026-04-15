import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const { data, error } = await supabase.from('tasks').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ task: data });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const body = await request.json();
  const payload: Record<string, unknown> = {};
  if (typeof body.title === 'string') payload.title = body.title;
  if (typeof body.description === 'string') payload.description = body.description;
  if (typeof body.status === 'string') payload.status = body.status;
  if ('parentId' in body) payload.parent_id = body.parentId;
  const { data, error } = await supabase.from('tasks').update(payload).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const { error } = await supabase.from('tasks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
