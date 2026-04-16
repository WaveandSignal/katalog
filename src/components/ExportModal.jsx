import { useEffect, useRef, useState } from 'react'
import { ASPECTS, KatalogCard } from './KatalogCard'
import { StreakCard } from './StreakCard'
import { getPhoto, getEntries } from '../services/storage'
import { renderEntryCard, renderStreakCard } from '../lib/renderCard'
import { Icon } from './Icons'

const PREVIEW_WIDTH = 320

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function ExportModal({ mode = 'entry', entry, streak, total, thumbEntry, onClose }) {
  const [aspect, setAspect] = useState(ASPECTS[0])
  const [show, setShow] = useState({
    showDate: true,
    showLocation: true,
    showNickname: true,
    showNotes: false,
  })
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [photoBlob, setPhotoBlob] = useState(null)
  const [thumbBlob, setThumbBlob] = useState(null)
  const [thumbDataUrl, setThumbDataUrl] = useState(null)
  const [catNumber, setCatNumber] = useState(null)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef()

  useEffect(() => {
    if (mode === 'entry' && entry) {
      getEntries().then(all => {
        const sorted = [...all].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        const idx = sorted.findIndex(e => e.id === entry.id)
        setCatNumber(idx >= 0 ? idx + 1 : null)
      })
    }
  }, [entry, mode])

  useEffect(() => {
    const ref = mode === 'entry' ? entry?.photoRef : thumbEntry?.photoRef
    if (ref) {
      getPhoto(ref).then(async blob => {
        if (!blob) return
        const dataUrl = await blobToDataUrl(blob)
        if (mode === 'entry') {
          setPhotoBlob(blob)
          setPhotoDataUrl(dataUrl)
        } else {
          setThumbBlob(blob)
          setThumbDataUrl(dataUrl)
        }
      })
    }
  }, [entry, thumbEntry, mode])

  async function handleExport() {
    setBusy(true)
    try {
      let canvas
      if (mode === 'entry') {
        canvas = await renderEntryCard({ aspect, photoBlob, entry, show, catNumber })
      } else {
        canvas = await renderStreakCard({ aspect, streak, total, thumbBlob })
      }

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], `katalog-${Date.now()}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
          setBusy(false)
          return
        } catch {}
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Unknown error'))
    } finally {
      setBusy(false)
    }
  }

  const scale = PREVIEW_WIDTH / aspect.w
  const cardProps = mode === 'entry'
    ? { aspect, photoUrl: photoDataUrl, entry, show, catNumber }
    : { aspect, streak, total, thumbUrl: thumbDataUrl }
  const CardComponent = mode === 'entry' ? KatalogCard : StreakCard

  function toggle(key) {
    setShow(s => ({ ...s, [key]: !s[key] }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Export {mode === 'streak' ? 'streak' : 'card'}</div>

        <div className="aspect-picker">
          {ASPECTS.map(a => (
            <button
              key={a.id}
              className={`aspect-btn ${aspect.id === a.id ? 'active' : ''}`}
              onClick={() => setAspect(a)}
            >
              <div className="aspect-btn-ratio">{a.label}</div>
              <div className="aspect-btn-sub">{a.sub}</div>
            </button>
          ))}
        </div>

        <div className="preview-wrap">
          <div
            className="preview-scale"
            style={{
              transform: `scale(${scale})`,
              width: aspect.w,
              height: aspect.h,
              transformOrigin: 'top left',
              marginBottom: -(aspect.h - aspect.h * scale),
              marginRight: -(aspect.w - aspect.w * scale),
            }}
          >
            <CardComponent ref={previewRef} {...cardProps} />
          </div>
        </div>

        {mode === 'entry' && (
          <div>
            {[
              { key: 'showDate', label: 'Date' },
              { key: 'showLocation', label: 'Location', disabled: !entry?.locationDisplay },
              { key: 'showNickname', label: 'Nickname', disabled: !entry?.nickname },
              { key: 'showNotes', label: 'Notes', disabled: !entry?.notes },
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                className={`checkbox-row ${show[opt.key] && !opt.disabled ? 'checked' : ''} ${opt.disabled ? 'disabled' : ''}`}
                onClick={() => !opt.disabled && toggle(opt.key)}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                <div className="checkbox-mark">
                  {show[opt.key] && !opt.disabled && <Icon.Check />}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="action-row" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleExport} disabled={busy}>
            {busy ? 'Rendering…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}
