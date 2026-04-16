import { useEffect, useState } from 'react'

const COLORS = ['#ff6b35', '#ffb84d', '#1a1a1a', '#c94510', '#f5c99b']

export function MilestoneToast({ milestone, onDismiss, onShare }) {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: COLORS[i % COLORS.length],
      duration: 1.6 + Math.random() * 0.8,
    }))
  )

  useEffect(() => {
    const t = setTimeout(() => {}, 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <div className="confetti">
        {pieces.map(p => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="toast-overlay" onClick={onDismiss}>
        <div className="toast-card" onClick={e => e.stopPropagation()}>
          <div className="toast-emoji">🎉</div>
          <div className="toast-title">{milestone.title}</div>
          <div className="toast-sub">{milestone.subtitle}</div>
          <div className="toast-actions">
            <button className="btn btn-secondary" onClick={onDismiss}>Dismiss</button>
            {onShare && <button className="btn" onClick={onShare}>Share</button>}
          </div>
        </div>
      </div>
    </>
  )
}
