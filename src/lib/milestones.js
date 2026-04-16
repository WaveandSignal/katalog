export const MILESTONES = [
  { id: 'first-cat', kind: 'count', threshold: 1, title: 'First Cat', subtitle: '1 cat cataloged' },
  { id: '10-cats', kind: 'count', threshold: 10, title: 'Ten Cats', subtitle: '10 cats cataloged' },
  { id: '50-cats', kind: 'count', threshold: 50, title: 'Half-Century', subtitle: '50 cats cataloged' },
  { id: '100-cats', kind: 'count', threshold: 100, title: 'Century Cat', subtitle: '100 cats cataloged' },
  { id: '500-cats', kind: 'count', threshold: 500, title: 'Five Hundred Strong', subtitle: '500 cats cataloged' },
  { id: 'streak-7', kind: 'streak', threshold: 7, title: '7-Day Streak', subtitle: 'A week of cats' },
  { id: 'streak-30', kind: 'streak', threshold: 30, title: '30-Day Streak', subtitle: 'A month of cats' },
  { id: 'streak-100', kind: 'streak', threshold: 100, title: '100-Day Streak', subtitle: '100 days in a row' },
  { id: 'streak-365', kind: 'streak', threshold: 365, title: '365-Day Streak', subtitle: 'A year of cats' },
  { id: 'nicknames-5', kind: 'nicknames', threshold: 5, title: '5 Unique Nicknames', subtitle: 'A naming talent' },
  { id: 'neighborhoods-3', kind: 'neighborhoods', threshold: 3, title: '3 Neighborhoods', subtitle: 'Cataloged across the map' },
]

export function computeEarned(stats) {
  return MILESTONES.filter(m => {
    if (m.kind === 'count') return stats.total >= m.threshold
    if (m.kind === 'streak') return stats.longestStreak >= m.threshold
    if (m.kind === 'nicknames') return stats.uniqueNicknames >= m.threshold
    if (m.kind === 'neighborhoods') return (stats.uniqueNeighborhoods || 0) >= m.threshold
    return false
  })
}

export function diffMilestones(before, after) {
  const b = new Set(computeEarned(before).map(m => m.id))
  const a = computeEarned(after)
  return a.filter(m => !b.has(m.id))
}
