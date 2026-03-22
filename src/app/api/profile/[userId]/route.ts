import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const body = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    const values = Object.values(body);
    
    const columns = ['id', ...keys];
    const queryValues = [userId, ...values];
    
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const setClause = keys.map((key) => `"${key}" = EXCLUDED."${key}"`).join(', ');
    const columnsFormatted = columns.map(c => `"${c}"`).join(', ');

    const query = `
      INSERT INTO users (${columnsFormatted})
      VALUES (${placeholders})
      ON CONFLICT (id) DO UPDATE SET ${setClause}
      RETURNING *
    `;

    const result = await pool.query(query, queryValues);

    return NextResponse.json(result.rows[0], { status: 200 });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Error updating profile' }, { status: 500 });
  }
}
