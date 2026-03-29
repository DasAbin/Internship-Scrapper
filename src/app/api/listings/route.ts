import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'score';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filtersStr = searchParams.get('filters');
    const userId = searchParams.get('userId');

    let filters: any = {};
    if (filtersStr) {
      try {
        filters = JSON.parse(filtersStr);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid filters JSON' }, { status: 400 });
      }
    }

    const offset = (page - 1) * limit;

    let userEmbedding = null;
    if (userId) {
      const userRes = await pool.query('SELECT embedding FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].embedding) {
        userEmbedding = userRes.rows[0].embedding;
      }
    }

    let queryParams: any[] = [];
    let paramIndex = 1;

    let selectClause = 'SELECT l.*';
    let fromClause = 'FROM listings l';
    
    if (userId) {
      selectClause += ', ul.status as user_status';
      fromClause += ` LEFT JOIN user_listings ul ON l.id = ul.listing_id AND ul.user_id = $${paramIndex++}`;
      queryParams.push(userId);
    }

    let whereConditions = [];

    if (type) {
      whereConditions.push(`l.type = $${paramIndex++}`);
      queryParams.push(type);
    }

    if (filters.remote !== undefined) {
      whereConditions.push(`l.remote = $${paramIndex++}`);
      queryParams.push(filters.remote);
    }

    if (filters.domains && filters.domains.length > 0) {
      whereConditions.push(`l.domain = ANY($${paramIndex++})`);
      queryParams.push(filters.domains);
    }

    if (filters.stipend_min !== undefined) {
      whereConditions.push(`l.stipend_max >= $${paramIndex++}`);
      queryParams.push(filters.stipend_min);
    }

    if (filters.duration) {
      whereConditions.push(`l.duration = $${paramIndex++}`);
      queryParams.push(filters.duration);
    }

    if (filters.sources && filters.sources.length > 0) {
      whereConditions.push(`l.source = ANY($${paramIndex++})`);
      queryParams.push(filters.sources);
    }

    let whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) ${fromClause} ${whereClause}`;
    const countRes = await pool.query(countQuery, queryParams);
    const total = parseInt(countRes.rows[0].count, 10);

    let orderByClause = '';
    
    if (sort === 'score' && userEmbedding) {
      orderByClause = `ORDER BY l.embedding <=> $${paramIndex++}`;
      queryParams.push('[' + userEmbedding.join(',') + ']');
    } else if (sort === 'score' || sort === 'recency') {
      orderByClause = 'ORDER BY l.posted_at DESC';
    } else if (sort === 'deadline') {
      orderByClause = 'ORDER BY l.deadline ASC';
    } else if (sort === 'stipend') {
      orderByClause = 'ORDER BY l.stipend_max DESC';
    } else {
      orderByClause = 'ORDER BY l.posted_at DESC';
    }

    const dataQuery = `${selectClause} ${fromClause} ${whereClause} ${orderByClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const dataRes = await pool.query(dataQuery, queryParams);

    return NextResponse.json({
      listings: dataRes?.rows ?? [],
      total: total || 0,
      page
    }, { status: 200 });

  } catch (error: any) {
    console.error('Listings error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
