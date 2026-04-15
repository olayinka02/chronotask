import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ tasks: [] });
  const { data, error } = await supabase.from('tasks').select('*').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  const { title, description, parentId } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const { data, error } = await supabase
    .from('tasks')
    .insert({ title, description, parent_id: parentId ?? null, status: 'todo' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data }, { status: 201 });
}
