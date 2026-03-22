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

    const query = `
      SELECT l.*, ul.status as user_status
      FROM user_listings ul
      JOIN listings l ON l.id = ul.listing_id
      WHERE ul.user_id = $1 AND ul.status NOT IN ('ignore', 'ignored')
      ORDER BY ul.updated_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return NextResponse.json(result.rows, { status: 200 });

  } catch (error: any) {
    console.error('Saved listings error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
