const NHL_BASE = 'https://api-web.nhle.com/v1'

async function fetchJson(path) {
  const response = await fetch(`${NHL_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'personal-web-ecosystem/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`NHL API returned ${response.status} for ${path}`)
  }

  return response.json()
}

export async function onRequestGet() {
  try {
    const [schedule, roster, stats, playoffStats] = await Promise.all([
      fetchJson('/club-schedule-season/COL/20262027'),
      fetchJson('/roster/COL/current'),
      fetchJson('/club-stats/COL/20262027/2'),
      fetchJson('/club-stats/COL/20262027/3'),
    ])

    return Response.json(
      {
        schedule,
        roster,
        stats,
        playoffStats,
        meta: {
          source: 'nhl',
          refreshedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      },
    )
  } catch (error) {
    console.error('Avs Hub NHL request failed:', error)

    return Response.json(
      {
        error: 'NHL data is temporarily unavailable.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
