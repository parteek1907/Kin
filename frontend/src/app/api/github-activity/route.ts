import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'darshohri';

    const [userRes, eventsRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'KIN-Career-App' }
      }).then(r => r.ok ? r.json() : null),
      fetch(`https://api.github.com/users/${username}/events`, {
        headers: { 'User-Agent': 'KIN-Career-App' }
      }).then(r => r.ok ? r.json() : []),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
        headers: { 'User-Agent': 'KIN-Career-App' }
      }).then(r => r.ok ? r.json() : [])
    ]);

    const pushEvents = Array.isArray(eventsRes) ? eventsRes.filter(e => e.type === 'PushEvent') : [];
    const activeRepos = Array.from(new Set(pushEvents.map(e => e.repo?.name))).filter(Boolean);

    return NextResponse.json({
      success: true,
      username,
      name: userRes?.name || username,
      avatarUrl: userRes?.avatar_url,
      publicRepos: userRes?.public_repos || (Array.isArray(reposRes) ? reposRes.length : 6),
      followers: userRes?.followers || 0,
      recentPushesCount: pushEvents.length,
      activeRepos,
      topRepositories: Array.isArray(reposRes) ? reposRes.map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        language: r.language,
        url: r.html_url,
        updatedAt: r.updated_at
      })) : []
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Failed to fetch GitHub activity'
    }, { status: 500 });
  }
}
