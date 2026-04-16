import { useEffect, useState } from 'react'
import { getPhoto } from '../services/storage'

export function PhotoThumb({ photoRef, alt = '' }) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let active = true
    let obj = null
    if (photoRef) {
      getPhoto(photoRef).then(blob => {
        if (!active || !blob) return
        obj = URL.createObjectURL(blob)
        setUrl(obj)
      })
    }
    return () => {
      active = false
      if (obj) URL.revokeObjectURL(obj)
    }
  }, [photoRef])
  if (!url) return <div style={{ background: 'var(--border)', width: '100%', height: '100%' }} />
  return <img src={url} alt={alt} />
}
