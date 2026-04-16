import { useEffect, useState } from 'react'
import { deleteEntry, getEntryById, getPhoto } from '../services/storage'
import { EditEntry } from '../components/EditEntry'
import { ExportModal } from '../components/ExportModal'
import { Icon } from '../components/Icons'
import { formatDateTime } from '../lib/format'

export function EntryDetail({ entryId, onBack, onChanged }) {
  const [entry, setEntry] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [editing, setEditing] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function load() {
    const e = await getEntryById(entryId)
    setEntry(e)
  }

  useEffect(() => { load() }, [entryId])

  useEffect(() => {
    let obj = null
    if (entry?.photoRef) {
      getPhoto(entry.photoRef).then(blob => {
        if (blob) {
          obj = URL.createObjectURL(blob)
          setPhotoUrl(obj)
        }
      })
    }
    return () => { if (obj) URL.revokeObjectURL(obj) }
  }, [entry])

  if (!entry) return <div className="app"><p>Loading…</p></div>

  if (editing) {
    return (
      <EditEntry
        existing={entry}
        onSaved={async () => { setEditing(false); await load(); onChanged?.() }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  async function handleDelete() {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    await deleteEntry(entry.id)
    onChanged?.()
    onBack()
  }

  return (
    <div className="app">
      <div className="back-row">
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon.ArrowLeft /></button>
        <h2>{entry.nickname || 'Untitled'}</h2>
        <button className="back-btn" onClick={() => setExporting(true)} aria-label="Export">
          <Icon.Share />
        </button>
      </div>

      <div className="detail-photo">
        {photoUrl && <img src={photoUrl} alt={entry.nickname || 'cat'} />}
      </div>

      <div className="detail-meta">
        <div className="detail-meta-row">
          <span className="detail-meta-key">Date</span>
          <span className="detail-meta-val">{formatDateTime(entry.timestamp)}</span>
        </div>
        {entry.locationDisplay && (
          <div className="detail-meta-row">
            <span className="detail-meta-key">Location</span>
            <span className="detail-meta-val">{entry.locationDisplay}</span>
          </div>
        )}
      </div>

      {entry.notes && <div className="detail-notes">{entry.notes}</div>}

      <div className="action-row">
        <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn" onClick={() => setExporting(true)}>Share card</button>
      </div>
      <div className="action-row">
        <button className="btn btn-danger" onClick={handleDelete}>
          <Icon.Trash style={{ verticalAlign: 'middle', marginRight: 6 }} /> Delete
        </button>
      </div>

      {exporting && (
        <ExportModal
          mode="entry"
          entry={entry}
          onClose={() => setExporting(false)}
        />
      )}
    </div>
  )
}
