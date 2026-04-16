import { useEffect, useState } from 'react'
import { saveEntry, updateEntry, savePhoto, getPhoto } from '../services/storage'
import { getCurrentLocation, reverseGeocode } from '../lib/geocode'
import { Icon } from './Icons'

export function EditEntry({ photoBlob, existing, onSaved, onCancel, cancelLabel = 'Cancel' }) {
  const [nickname, setNickname] = useState(existing?.nickname ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [locationOn, setLocationOn] = useState(!!existing?.latitude)
  const [coords, setCoords] = useState(existing ? { latitude: existing.latitude, longitude: existing.longitude } : null)
  const [locationDisplay, setLocationDisplay] = useState(existing?.locationDisplay ?? null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    let obj = null
    if (photoBlob) {
      obj = URL.createObjectURL(photoBlob)
      setPreviewUrl(obj)
    } else if (existing?.photoRef) {
      getPhoto(existing.photoRef).then(blob => {
        if (blob) {
          obj = URL.createObjectURL(blob)
          setPreviewUrl(obj)
        }
      })
    }
    return () => { if (obj) URL.revokeObjectURL(obj) }
  }, [photoBlob, existing])

  async function toggleLocation(on) {
    setLocationOn(on)
    setLocationError(null)
    if (!on) {
      setCoords(null)
      setLocationDisplay(null)
      return
    }
    setLocating(true)
    try {
      const c = await getCurrentLocation()
      setCoords(c)
      try {
        const display = await reverseGeocode(c.latitude, c.longitude)
        setLocationDisplay(display)
      } catch {
        setLocationDisplay('Location captured')
      }
    } catch (err) {
      setLocationOn(false)
      setLocationError(err.message || 'Could not get location')
    } finally {
      setLocating(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      let photoRef = existing?.photoRef ?? null
      if (photoBlob && !existing) {
        photoRef = await savePhoto(photoBlob)
      }
      const payload = {
        nickname: nickname.trim() || null,
        notes: notes.trim() || null,
        latitude: locationOn && coords ? coords.latitude : null,
        longitude: locationOn && coords ? coords.longitude : null,
        locationDisplay: locationOn ? locationDisplay : null,
      }
      let saved
      if (existing) {
        saved = await updateEntry(existing.id, payload)
      } else {
        saved = await saveEntry({ photoRef, ...payload })
      }
      onSaved(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app">
      <div className="back-row">
        <button className="back-btn" onClick={onCancel} aria-label="Back"><Icon.ArrowLeft /></button>
        <h2>{existing ? 'Edit entry' : 'New cat'}</h2>
      </div>

      <div className="capture-photo">
        {previewUrl && <img src={previewUrl} alt="Cat" />}
      </div>

      <div className="field">
        <label>Nickname</label>
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Name this cat..."
          maxLength={60}
        />
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What's the story?"
          maxLength={500}
        />
      </div>

      <div className="toggle-row">
        <div>
          <div className="toggle-row-label">Location</div>
          <div className="toggle-row-sub">
            {locating ? 'Getting location…'
              : locationError ? locationError
              : locationOn && locationDisplay ? locationDisplay
              : 'Capture neighborhood'}
          </div>
        </div>
        <label className="switch">
          <input type="checkbox" checked={locationOn} onChange={e => toggleLocation(e.target.checked)} />
          <span className="switch-slider" />
        </label>
      </div>

      <div className="action-row">
        <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button className="btn" onClick={handleSave} disabled={saving || locating}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
