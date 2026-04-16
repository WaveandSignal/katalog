import { localDayKey } from '../lib/format'

export function HeatMap({ dayCounts, weeks = 26 }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayOfWeek = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - (weeks * 7) + (6 - dayOfWeek))

  const cells = []
  const cursor = new Date(start)
  const days = weeks * 7
  for (let i = 0; i < days; i++) {
    const key = localDayKey(cursor)
    const count = dayCounts[key] || 0
    cells.push({ key, count, date: new Date(cursor) })
    cursor.setDate(cursor.getDate() + 1)
  }

  function level(count) {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 6) return 3
    return 4
  }

  return (
    <div className="heat">
      <div className="heat-grid">
        {cells.map(c => (
          <div
            key={c.key}
            className="heat-cell"
            data-level={level(c.count)}
            title={`${c.key}: ${c.count} cat${c.count === 1 ? '' : 's'}`}
          />
        ))}
      </div>
    </div>
  )
}
