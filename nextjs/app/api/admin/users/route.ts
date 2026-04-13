import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: users, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { error } = await supabaseAdmin.rpc('add_admin_user', {
      p_username: username,
      p_password: password
    });

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // Prevent deleting the very last admin
    const { count } = await supabaseAdmin
      .from('admin_users')
      .select('*', { count: 'exact', head: true });
      
    if (count !== null && count <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin user' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
