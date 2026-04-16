import { useRef, useState } from 'react'
import { EditEntry } from './EditEntry'
import { Icon } from './Icons'

export function Capture({ onDone, onCancel }) {
  const [photoBlob, setPhotoBlob] = useState(null)
  const cameraRef = useRef()
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) setPhotoBlob(file)
  }

  if (photoBlob) {
    return (
      <EditEntry
        photoBlob={photoBlob}
        onSaved={onDone}
        onCancel={() => setPhotoBlob(null)}
        cancelLabel="Retake"
      />
    )
  }

  return (
    <div className="capture-intro">
      <h1>New Cat</h1>
      <p>Snap or upload a photo to catalog.</p>
      <div className="capture-intro-buttons">
        <button className="btn" onClick={() => cameraRef.current?.click()}>
          <Icon.Camera style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} /> Take photo
        </button>
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>Upload from library</button>
        <button className="btn btn-danger" onClick={onCancel}>Cancel</button>
      </div>
      <input ref={cameraRef} className="hidden-input" type="file" accept="image/*" capture="environment" onChange={handleFile} />
      <input ref={fileRef} className="hidden-input" type="file" accept="image/*" onChange={handleFile} />
    </div>
  )
}
