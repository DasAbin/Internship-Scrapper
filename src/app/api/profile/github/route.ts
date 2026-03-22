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
    const { username, userId } = body;

    if (!username || !userId) {
      return NextResponse.json({ error: 'Missing username or userId' }, { status: 400 });
    }

    const githubResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=50`);
    if (!githubResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: githubResponse.status });
    }

    const repos = await githubResponse.json();
    
    const languagesMap: Record<string, number> = {};
    const topicsSet = new Set<string>();

    for (const repo of repos) {
      if (repo.language) {
        languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
      }
      if (Array.isArray(repo.topics)) {
        repo.topics.forEach((topic: string) => topicsSet.add(topic));
      }
    }

    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
    const topics = Array.from(topicsSet);

    await pool.query(`
      INSERT INTO users (id, github_username, github_languages, github_topics)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET 
        github_username = EXCLUDED.github_username,
        github_languages = EXCLUDED.github_languages,
        github_topics = EXCLUDED.github_topics
    `, [userId, username, topLanguages, topics]);

    return NextResponse.json({ 
      languages: topLanguages,
      topics: topics
    }, { status: 200 });

  } catch (error: any) {
    console.error('Github profile error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
