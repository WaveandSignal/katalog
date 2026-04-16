import { useEffect, useState } from 'react'
import { getStats, getEntries } from '../services/storage'
import { HeatMap } from '../components/HeatMap'
import { computeEarned } from '../lib/milestones'
import { ExportModal } from '../components/ExportModal'

export function StatsView({ refreshKey }) {
  const [stats, setStats] = useState(null)
  const [latestEntry, setLatestEntry] = useState(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    getStats().then(setStats)
    getEntries().then(list => setLatestEntry(list[0] || null))
  }, [refreshKey])

  if (!stats) return <div className="app"><p>Loading…</p></div>

  const earned = computeEarned(stats)

  return (
    <div className="app">
      <div className="catalog-header">
        <div className="wordmark">Stats</div>
      </div>

      <div className="stat-hero">
        <div className="stat-hero-num">{stats.currentStreak}</div>
        <div className="stat-hero-label">Current streak</div>
      </div>

      {stats.total > 0 && (
        <div className="action-row" style={{ marginTop: 0, marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setSharing(true)}>Share streak</button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-val">{stats.total}</div>
          <div className="stat-card-label">Total cats</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{stats.longestStreak}</div>
          <div className="stat-card-label">Longest streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{stats.daysActive}</div>
          <div className="stat-card-label">Days active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{stats.uniqueNicknames}</div>
          <div className="stat-card-label">Unique nicknames</div>
        </div>
        {stats.topLocation && (
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-card-val" style={{ fontSize: 18 }}>{stats.topLocation}</div>
            <div className="stat-card-label">Top neighborhood</div>
          </div>
        )}
      </div>

      <div className="section-title">Activity</div>
      <HeatMap dayCounts={stats.dayCounts} weeks={26} />

      {earned.length > 0 && (
        <>
          <div className="section-title">Milestones earned</div>
          <div className="milestone-list">
            {earned.map(m => (
              <div key={m.id} className="milestone-item">
                <div>
                  <div className="milestone-title">{m.title}</div>
                  <div className="milestone-sub">{m.subtitle}</div>
                </div>
                <div style={{ fontSize: 22 }}>🏅</div>
              </div>
            ))}
          </div>
        </>
      )}

      {sharing && (
        <ExportModal
          mode="streak"
          streak={stats.currentStreak}
          total={stats.total}
          thumbEntry={latestEntry}
          onClose={() => setSharing(false)}
        />
      )}
    </div>
  )
}
