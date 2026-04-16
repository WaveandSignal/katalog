import { forwardRef } from 'react'

export const StreakCard = forwardRef(function StreakCard(
  { aspect, streak, total, thumbUrl },
  ref
) {
  return (
    <div ref={ref} className="kcard" style={{ width: aspect.w, height: aspect.h }}>
      <div className="kcard-streak-body">
        {thumbUrl && (
          <div className="kcard-streak-thumb">
            <img src={thumbUrl} alt="" crossOrigin="anonymous" />
          </div>
        )}
        <div>
          <div className="kcard-streak-num">{streak}</div>
          <div className="kcard-streak-label">Day Streak</div>
        </div>
        <div className="kcard-streak-stats">
          <div>
            <div className="kcard-streak-stat-val">{total}</div>
            <div className="kcard-streak-stat-label">Cats cataloged</div>
          </div>
        </div>
      </div>
      <div className="kcard-footer">
        <div className="kcard-wordmark">Katalog</div>
        <div className="kcard-tagline">Cats I've met</div>
      </div>
    </div>
  )
})
