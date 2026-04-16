import { useEffect, useMemo, useState } from 'react'
import { getEntries, getStats } from '../services/storage'
import { PhotoThumb } from '../components/PhotoThumb'
import { Icon } from '../components/Icons'

export function CatalogView({ onOpenEntry, onNewEntry, refreshKey }) {
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getEntries().then(setEntries)
    getStats().then(setStats)
  }, [refreshKey])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter(e =>
      (e.nickname && e.nickname.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.locationDisplay && e.locationDisplay.toLowerCase().includes(q))
    )
  }, [entries, query])

  const showNudge = stats && stats.total > 0 && !stats.loggedToday

  return (
    <div className="app">
      <div className="catalog-header">
        <div className="wordmark">Katalog</div>
        {stats && (
          <div className="streak">
            <div className={`streak-num ${stats.currentStreak > 0 ? 'hot' : 'cold'}`}>{stats.currentStreak}</div>
            <div className="streak-label">Day streak</div>
          </div>
        )}
      </div>

      {showNudge && <div className="nudge">No cats yet today 🐾</div>}

      {entries.length > 0 && (
        <div className="search-row">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search nicknames, notes, places…"
          />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty-state">
          <h2>Start your Katalog</h2>
          <p>Tap the camera button to add your first cat.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No matches.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(entry => (
            <button
              key={entry.id}
              className="cell"
              onClick={() => onOpenEntry(entry.id)}
            >
              <PhotoThumb photoRef={entry.photoRef} alt={entry.nickname || 'cat'} />
              {entry.nickname && <div className="cell-nick">{entry.nickname}</div>}
            </button>
          ))}
        </div>
      )}

      <button className="fab" onClick={onNewEntry} aria-label="New entry">
        <Icon.Plus />
      </button>
    </div>
  )
}
