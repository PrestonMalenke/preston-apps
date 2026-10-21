import StructuralPageLoader from '../components/StructuralPageLoader'
import { useEffect, useMemo, useState } from 'react'
import './AvsHub.css'
import { getAvsData } from '../services/avsApi'

const TEAM = 'COL'
const SEASON = '20262027'
const GAME_TYPE = 2

const LINES = [
  { label: 'Line 1', players: ['Artturi Lehkonen', 'Nathan MacKinnon', 'Martin Necas'] },
  { label: 'Line 2', players: ['Gabriel Landeskog', 'Brock Nelson', 'Nazem Kadri'] },
  { label: 'Line 3', players: ['Jaden Schwartz', 'Fedor Svechkov', 'T.J. Hughes'] },
  { label: 'Line 4', players: ['Parker Kelly', 'Nicolas Roy', "Zachary L'Heureux"] },
]

const PAIRS = [
  { label: 'Pair 1', players: ['Devon Toews', 'Cale Makar'] },
  { label: 'Pair 2', players: ['Brett Kulak', 'Sam Malinski'] },
  { label: 'Pair 3', players: ['Josh Manson', 'Brent Burns'] },
]

const GOALIES = ['Scott Wedgewood', 'Mackenzie Blackwood']

const TEAM_LOGO = 'https://assets.nhle.com/logos/nhl/svg/COL_light.svg'

const formatName = (player) =>
  [player?.firstName?.default, player?.lastName?.default].filter(Boolean).join(' ')

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', weekday: 'short' }).format(
    new Date(`${date}T12:00:00`),
  )

const formatTime = (game) => {
  if (!game?.startTimeUTC) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Denver',
    timeZoneName: 'short',
  }).format(new Date(game.startTimeUTC))
}


function getMountainDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function getNetworkNames(game) {
  return (game?.tvBroadcasts || [])
    .map((network) => network?.network || network?.name || network?.market || '')
    .filter(Boolean)
}

function getStreaming(game) {
  const networks = getNetworkNames(game)
  const joined = networks.join(' ').toUpperCase()

  if (joined.includes('TNT') || joined.includes('TRUTV')) return 'HBO Max'
  if (joined.includes('ESPN+') || joined.includes('HULU')) return 'ESPN+ · Disney+ · Hulu'
  if (joined.includes('ESPN') || joined.includes('ABC')) return 'ESPN App'
  if (joined.includes('ALT') || joined.includes('KUSA') || joined.includes('KTVD')) return 'Altitude+'

  return 'Altitude+'
}

function getOpponent(game) {
  const isHome = game?.homeTeam?.abbrev === TEAM
  return {
    isHome,
    team: isHome ? game?.awayTeam : game?.homeTeam,
  }
}

function getGameResult(game) {
  if (!game || !['OFF', 'FINAL'].includes(game.gameState)) return null
  const isHome = game.homeTeam?.abbrev === TEAM
  const own = isHome ? game.homeTeam : game.awayTeam
  const opp = isHome ? game.awayTeam : game.homeTeam
  if (typeof own?.score !== 'number' || typeof opp?.score !== 'number') return null
  return {
    won: own.score > opp.score,
    own: own.score,
    opp: opp.score,
    overtime: ['OT', 'SO'].includes(game?.periodDescriptor?.periodType),
  }
}

function PlayerCard({ player, stats, lineLabel }) {
  const name = formatName(player)
  const stat = stats?.find((item) => item.playerId === player?.id)
  const isGoalie = player?.positionCode === 'G'
  const headshot =
    player?.headshot || (player?.id ? `https://assets.nhle.com/mugs/nhl/20262027/COL/${player.id}.png` : null)

  return (
    <article className="avs-player-card">
      <span className="avs-jersey-number">#{player?.sweaterNumber ?? '—'}</span>
      <div className="avs-player-photo-wrap">
        {headshot ? <img className="avs-player-photo" src={headshot} alt={name} /> : null}
      </div>
      <div className="avs-player-copy">
        <span className="avs-player-line">{lineLabel}</span>
        <h3>{name}</h3>
        <span className="avs-player-position">{player?.positionCode}</span>
      </div>
      <div className="avs-player-stats">
        {isGoalie ? (
          <>
            <Stat mini label="GP" value={stat?.gamesPlayed ?? 0} />
            <Stat mini label="W" value={stat?.wins ?? 0} />
            <Stat mini label="GAA" value={stat?.goalsAgainstAverage?.toFixed?.(2) ?? '—'} />
            <Stat mini label="SV%" value={stat?.savePercentage?.toFixed?.(3) ?? '—'} />
          </>
        ) : (
          <>
            <Stat mini label="GP" value={stat?.gamesPlayed ?? 0} />
            <Stat mini label="G" value={stat?.goals ?? 0} />
            <Stat mini label="A" value={stat?.assists ?? 0} />
            <Stat mini label="PTS" value={stat?.points ?? 0} />
            <Stat mini label="+/−" value={stat?.plusMinus ?? 0} />
          </>
        )}
      </div>
    </article>
  )
}

function mergePlayerStats(primary = [], secondary = []) {
  const merged = new Map()

  ;[...primary, ...secondary].forEach((player) => {
    const current = merged.get(player.playerId) || {}
    const next = { ...current, ...player }

    ;[
      'gamesPlayed',
      'goals',
      'assists',
      'points',
      'plusMinus',
      'wins',
      'losses',
      'otLosses',
      'shots',
      'powerPlayGoals',
      'powerPlayPoints',
      'shorthandedGoals',
      'shorthandedPoints',
    ].forEach((key) => {
      next[key] = (current[key] || 0) + (player[key] || 0)
    })

    if (player.positionCode === 'G' || current.positionCode === 'G') {
      const currentGames = current.gamesPlayed || 0
      const playerGames = player.gamesPlayed || 0
      const totalGames = currentGames + playerGames

      if (totalGames > 0) {
        const currentGaa = current.goalsAgainstAverage || 0
        const playerGaa = player.goalsAgainstAverage || 0
        const currentSv = current.savePercentage || 0
        const playerSv = player.savePercentage || 0

        next.goalsAgainstAverage =
          ((currentGaa * currentGames) + (playerGaa * playerGames)) / totalGames
        next.savePercentage =
          ((currentSv * currentGames) + (playerSv * playerGames)) / totalGames
      }
    }

    merged.set(player.playerId, next)
  })

  return [...merged.values()]
}

function Stat({ label, value, mini = false }) {
  return (
    <div className={mini ? 'avs-stat avs-stat--mini' : 'avs-stat'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function AvsHub() {
  const [tab, setTab] = useState('stats')
  const [schedule, setSchedule] = useState([])
  const [roster, setRoster] = useState([])
  const [skaterStats, setSkaterStats] = useState([])
  const [goalieStats, setGoalieStats] = useState([])
  const [playoffSkaterStats, setPlayoffSkaterStats] = useState([])
  const [playoffGoalieStats, setPlayoffGoalieStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getAvsData()

        if (cancelled) return

        const scheduleData = data.schedule || {}
        const rosterData = data.roster || {}
        const statsData = data.stats || {}
        const playoffStatsData = data.playoffStats || {}

        setSchedule(scheduleData.games || [])
        setRoster([
          ...(rosterData.forwards || []),
          ...(rosterData.defensemen || []),
          ...(rosterData.goalies || []),
        ])
        setSkaterStats(statsData.skaters || [])
        setGoalieStats(statsData.goalies || [])
        setPlayoffSkaterStats(playoffStatsData.skaters || [])
        setPlayoffGoalieStats(playoffStatsData.goalies || [])
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load Avalanche data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeSkaterStats = useMemo(
    () => mergePlayerStats(skaterStats, playoffSkaterStats),
    [skaterStats, playoffSkaterStats],
  )

  const activeGoalieStats = useMemo(
    () => mergePlayerStats(goalieStats, playoffGoalieStats),
    [goalieStats, playoffGoalieStats],
  )

  const playerStats = useMemo(
    () => [...activeSkaterStats, ...activeGoalieStats],
    [activeSkaterStats, activeGoalieStats],
  )

  const rosterByName = useMemo(() => {
    const map = new Map()
    roster.forEach((player) => map.set(formatName(player), player))
    return map
  }, [roster])

  const completedGames = useMemo(
    () =>
      schedule
        .filter((game) => game.gameType !== 1)
        .map((game) => ({ game, result: getGameResult(game) }))
        .filter((item) => item.result),
    [schedule],
  )

  const teamSummary = useMemo(() => {
    let wins = 0
    let losses = 0
    let otLosses = 0
    let goalsFor = 0
    let goalsAgainst = 0
    let homeWins = 0
    let homeGames = 0
    let roadWins = 0
    let roadGames = 0

    completedGames.forEach(({ game, result }) => {
      goalsFor += result.own
      goalsAgainst += result.opp
      const isHome = game.homeTeam?.abbrev === TEAM
      if (isHome) {
        homeGames += 1
        if (result.won) homeWins += 1
      } else {
        roadGames += 1
        if (result.won) roadWins += 1
      }

      if (result.won) wins += 1
      else if (result.overtime) otLosses += 1
      else losses += 1
    })

    return {
      gamesPlayed: completedGames.length,
      wins,
      losses,
      otLosses,
      points: wins * 2 + otLosses,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      home: `${homeWins}-${Math.max(0, homeGames - homeWins)}`,
      road: `${roadWins}-${Math.max(0, roadGames - roadWins)}`,
    }
  }, [completedGames])

  const leaders = useMemo(() => {
    const sorted = [...activeSkaterStats]
    return {
      points: [...sorted].sort((a, b) => (b.points || 0) - (a.points || 0))[0],
      goals: [...sorted].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0],
      assists: [...sorted].sort((a, b) => (b.assists || 0) - (a.assists || 0))[0],
    }
  }, [activeSkaterStats])

  const unmatchedRoster = useMemo(() => {
    const assigned = new Set([
      ...LINES.flatMap((line) => line.players),
      ...PAIRS.flatMap((pair) => pair.players),
      ...GOALIES,
    ])
    return roster.filter((player) => !assigned.has(formatName(player)))
  }, [roster])

  return (
    <main className="avs-hub">
      <header className="avs-hero">
        <div className="avs-hero-brand">
          <img src={TEAM_LOGO} alt="" />
          <div>
            <span className="avs-kicker">COLORADO AVALANCHE</span>
            <h1>Avs Hub</h1>
            <p>2026–27 season center</p>
          </div>
        </div>
        <div className="avs-record-badge">
          <span>RECORD</span>
          <strong>{teamSummary.wins}-{teamSummary.losses}-{teamSummary.otLosses}</strong>
        </div>
      </header>

      <nav className="avs-tabs" aria-label="Avs Hub sections">
        {['stats', 'schedule', 'players'].map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? 'active' : ''}
            onClick={() => setTab(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      {loading ? <StructuralPageLoader label="Loading Avalanche data" type="metric" /> : null}
      {error ? <div className="avs-state avs-state--error">{error}</div> : null}

      {!loading && !error && tab === 'stats' ? (
        <section className="avs-panel">
          <div className="avs-section-heading">
            <div>
              <span className="avs-kicker">TEAM PERFORMANCE</span>
              <h2>Season stats</h2>
            </div>
            <span>{teamSummary.gamesPlayed} games played</span>
          </div>


          <div className="avs-stat-grid">
            <Stat label="Wins" value={teamSummary.wins} />
            <Stat label="Losses" value={teamSummary.losses} />
            <Stat label="OT losses" value={teamSummary.otLosses} />
            <Stat label="Points" value={teamSummary.points} />
            <Stat label="Goals for" value={teamSummary.goalsFor} />
            <Stat label="Goals against" value={teamSummary.goalsAgainst} />
            <Stat label="Goal diff." value={teamSummary.goalDiff > 0 ? `+${teamSummary.goalDiff}` : teamSummary.goalDiff} />
            <Stat label="Home" value={teamSummary.home} />
            <Stat label="Road" value={teamSummary.road} />
          </div>

          <div className="avs-leaders">
            <h2>Team leaders</h2>
            <div className="avs-leader-grid">
              {[
                ['Points', leaders.points, 'points'],
                ['Goals', leaders.goals, 'goals'],
                ['Assists', leaders.assists, 'assists'],
              ].map(([label, leader, key]) => (
                <article key={label} className="avs-leader-card">
                  <span>{label}</span>
                  <strong>{leader?.[key] ?? 0}</strong>
                  <p>{leader ? `${leader.firstName?.default || ''} ${leader.lastName?.default || ''}`.trim() : '—'}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error && tab === 'schedule' ? (
        <section className="avs-panel">
          <div className="avs-section-heading">
            <div>
              <span className="avs-kicker">FULL SEASON SCHEDULE</span>
              <h2>Schedule & streaming</h2>
            </div>
            <span>Times shown in Mountain Time</span>
          </div>

          <div className="avs-schedule-list">
            {schedule.map((game) => {
              const opponent = getOpponent(game)
              const result = getGameResult(game)
              const networks = getNetworkNames(game)
              const isToday = game.gameDate === getMountainDateKey()
              const isPreseason = game.gameType === 1
              const gameClasses = [
                'avs-game-row',
                result ? 'avs-game-row--completed' : '',
                isToday ? 'avs-game-row--today' : '',
                isPreseason ? 'avs-game-row--preseason' : '',
              ].filter(Boolean).join(' ')
              return (
                <article className={gameClasses} key={game.id}>
                  <div className="avs-game-date">
                    <div className="avs-game-date-topline">
                      <strong>{formatDate(game.gameDate)}</strong>
                      {isToday ? <span className="avs-game-badge avs-game-badge--today">Today</span> : null}
                      {isPreseason ? <span className="avs-game-badge avs-game-badge--preseason">Preseason</span> : null}
                    </div>
                    <span>{formatTime(game)}</span>
                  </div>
                  <div className="avs-game-matchup">
                    {opponent.team?.logo ? <img src={opponent.team.logo} alt="" /> : null}
                    <div>
                      <strong>{opponent.isHome ? 'vs.' : '@'} {opponent.team?.commonName?.default || opponent.team?.placeName?.default || opponent.team?.abbrev}</strong>
                      <span>{opponent.isHome ? 'Ball Arena' : 'Away'}</span>
                    </div>
                  </div>
                  <div className="avs-game-result">
                    {result ? (
                      <>
                        <strong className={result.won ? 'win' : 'loss'}>{result.won ? 'W' : 'L'} {result.own}–{result.opp}</strong>
                        <span>{result.overtime ? 'OT/SO' : 'Final'}</span>
                      </>
                    ) : (
                      <>
                        <strong>Upcoming</strong>
                        <span>{game.gameState === 'FUT' ? 'Scheduled' : game.gameState}</span>
                      </>
                    )}
                  </div>
                  <div className="avs-game-stream">
                    <span>STREAM</span>
                    <strong>{getStreaming(game)}</strong>
                    <small>{networks.length ? networks.join(' · ') : 'Altitude Sports regional broadcast'}</small>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {!loading && !error && tab === 'players' ? (
        <section className="avs-panel avs-players-panel">
          <div className="avs-section-heading">
            <div>
              <span className="avs-kicker">CURRENT PROJECTED LINEUP</span>
              <h2>Players</h2>
            </div>
            <span>Player stats update from NHL data</span>
          </div>

          <div className="avs-roster-group">
            <h2>Forwards</h2>
            {LINES.map((line) => (
              <div className="avs-line-group" key={line.label}>
                <div className="avs-line-label">{line.label}</div>
                <div className="avs-player-grid avs-player-grid--three">
                  {line.players.map((name) => {
                    const player = rosterByName.get(name)
                    return player ? <PlayerCard key={name} player={player} stats={playerStats} lineLabel={line.label} /> : null
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="avs-roster-group">
            <h2>Defense</h2>
            {PAIRS.map((pair) => (
              <div className="avs-line-group" key={pair.label}>
                <div className="avs-line-label">{pair.label}</div>
                <div className="avs-player-grid avs-player-grid--two">
                  {pair.players.map((name) => {
                    const player = rosterByName.get(name)
                    return player ? <PlayerCard key={name} player={player} stats={playerStats} lineLabel={pair.label} /> : null
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="avs-roster-group">
            <h2>Goalies</h2>
            <div className="avs-player-grid avs-player-grid--two">
              {GOALIES.map((name, index) => {
                const player = rosterByName.get(name)
                return player ? (
                  <PlayerCard key={name} player={player} stats={playerStats} lineLabel={index === 0 ? 'Starter' : 'Backup'} />
                ) : null
              })}
            </div>
          </div>

          {unmatchedRoster.length ? (
            <div className="avs-roster-group">
              <h2>Roster extras / injured</h2>
              <div className="avs-player-grid avs-player-grid--three">
                {unmatchedRoster.map((player) => (
                  <PlayerCard key={player.id} player={player} stats={playerStats} lineLabel="Roster" />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className="avs-data-note">
        Live team, schedule, roster and player-stat data: NHL. Projected lines: current lineup configuration.
      </footer>
    </main>
  )
}

export default AvsHub
