import { forwardRef } from 'react'
import { formatDate } from '../lib/format'

export const ASPECTS = [
  { id: '9x16', w: 1080, h: 1920, label: '9:16', sub: 'Stories' },
  { id: '1x1', w: 1080, h: 1080, label: '1:1', sub: 'Feed' },
  { id: '4x5', w: 1080, h: 1350, label: '4:5', sub: 'Portrait' },
]

export const KatalogCard = forwardRef(function KatalogCard(
  { aspect, photoUrl, entry, show, catNumber },
  ref
) {
  const { showDate, showLocation, showNickname, showNotes } = show
  const hasMeta = showDate || showLocation || showNickname || showNotes
  return (
    <div ref={ref} className="kcard" style={{ width: aspect.w, height: aspect.h }}>
      <div className="kcard-photo">
        {photoUrl && <img src={photoUrl} alt="" crossOrigin="anonymous" />}
      </div>
      {hasMeta && (
        <div className="kcard-meta">
          {showNickname && entry.nickname && <div className="kcard-nickname">{entry.nickname}</div>}
          {(showDate || showLocation) && (
            <div className="kcard-detail-row">
              {showDate && <span>{formatDate(entry.timestamp, { long: true })}</span>}
              {showDate && showLocation && entry.locationDisplay && <span>·</span>}
              {showLocation && entry.locationDisplay && <span>{entry.locationDisplay}</span>}
            </div>
          )}
          {showNotes && entry.notes && <div className="kcard-notes">{entry.notes}</div>}
        </div>
      )}
      <div className="kcard-footer">
        <div className="kcard-wordmark">Katalog</div>
        <div style={{ textAlign: 'right' }}>
          {catNumber && <div style={{ fontWeight: 800, fontSize: 18 }}>Cat #{catNumber}</div>}
          <div className="kcard-tagline">Cats I've met</div>
        </div>
      </div>
    </div>
  )
})
