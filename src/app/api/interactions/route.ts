import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, action } = body;
    const userId = body.userId || decodedToken.uid;

    if (!userId || !listingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validActions = ['save', 'apply', 'ignore', 'interviewing', 'rejected'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await pool.query(`
      INSERT INTO user_listings (user_id, listing_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, listing_id) 
      DO UPDATE SET status = EXCLUDED.status
    `, [userId, listingId, action]);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Interactions error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
