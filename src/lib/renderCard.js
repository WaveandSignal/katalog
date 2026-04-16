function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const BG = '#faf7f2'
const INK = '#1a1a1a'
const INK2 = '#555150'
const BORDER_W = 40
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

export async function renderEntryCard({ aspect, photoBlob, entry, show, catNumber }) {
  const { w, h } = aspect
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)

  const footerH = 80
  const metaLines = []
  if (show.showNickname && entry.nickname) metaLines.push({ text: entry.nickname, size: 32, weight: '800', color: INK })
  const detailParts = []
  if (show.showDate) {
    const d = new Date(entry.timestamp)
    detailParts.push(d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }))
  }
  if (show.showLocation && entry.locationDisplay) detailParts.push(entry.locationDisplay)
  if (detailParts.length) metaLines.push({ text: detailParts.join(' · '), size: 16, weight: '400', color: INK2 })
  if (show.showNotes && entry.notes) metaLines.push({ text: entry.notes, size: 16, weight: '400', color: INK, maxWidth: w - BORDER_W * 2 - 20 })

  let metaH = 0
  if (metaLines.length > 0) {
    metaH = 24
    for (const line of metaLines) {
      metaH += line.size * 1.4 + 4
    }
  }

  const photoY = BORDER_W
  const photoX = BORDER_W
  const photoW = w - BORDER_W * 2
  const photoH = h - BORDER_W - footerH - metaH - (metaH > 0 ? 0 : BORDER_W)

  if (photoBlob) {
    try {
      const dataUrl = await blobToDataUrl(photoBlob)
      const img = await loadImage(dataUrl)
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(photoX, photoY, photoW, photoH, 8)
      ctx.clip()
      const scale = Math.max(photoW / img.width, photoH / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, photoX + (photoW - sw) / 2, photoY + (photoH - sh) / 2, sw, sh)
      ctx.restore()
    } catch {}
  }

  if (metaLines.length > 0) {
    let y = photoY + photoH + 20
    for (const line of metaLines) {
      ctx.font = `${line.weight} ${line.size}px ${FONT}`
      ctx.fillStyle = line.color
      if (line.maxWidth) {
        wrapText(ctx, line.text, BORDER_W + 10, y + line.size, line.maxWidth, line.size * 1.4)
        const lineCount = Math.ceil(ctx.measureText(line.text).width / line.maxWidth)
        y += line.size * 1.4 * lineCount + 4
      } else {
        ctx.fillText(line.text, BORDER_W + 10, y + line.size)
        y += line.size * 1.4 + 4
      }
    }
  }

  const footerY = h - footerH
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(BORDER_W, footerY)
  ctx.lineTo(w - BORDER_W, footerY)
  ctx.stroke()

  ctx.font = `800 36px ${FONT}`
  ctx.fillStyle = INK
  ctx.fillText('Katalog', BORDER_W + 10, footerY + 48)

  const rightCol = []
  if (catNumber) rightCol.push(`Cat #${catNumber}`)
  rightCol.push("Cats I've met")

  ctx.textAlign = 'right'
  if (catNumber) {
    ctx.font = `800 18px ${FONT}`
    ctx.fillStyle = INK
    ctx.fillText(`Cat #${catNumber}`, w - BORDER_W - 10, footerY + 34)

    ctx.font = `400 12px ${FONT}`
    ctx.fillStyle = INK2
    ctx.fillText("Cats I've met", w - BORDER_W - 10, footerY + 54)
  } else {
    ctx.font = `400 13px ${FONT}`
    ctx.fillStyle = INK2
    ctx.fillText("Cats I've met", w - BORDER_W - 10, footerY + 46)
  }
  ctx.textAlign = 'left'

  return canvas
}

export async function renderStreakCard({ aspect, streak, total, thumbBlob }) {
  const { w, h } = aspect
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  let y = h * 0.12

  if (thumbBlob) {
    try {
      const dataUrl = await blobToDataUrl(thumbBlob)
      const img = await loadImage(dataUrl)
      const thumbSize = Math.min(160, w * 0.3)
      const thumbX = cx - thumbSize / 2
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(thumbX, y, thumbSize, thumbSize, 16)
      ctx.clip()
      const scale = Math.max(thumbSize / img.width, thumbSize / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, thumbX + (thumbSize - sw) / 2, y + (thumbSize - sh) / 2, sw, sh)
      ctx.restore()
      y += thumbSize + 32
    } catch {}
  }

  ctx.textAlign = 'center'
  ctx.font = `900 ${Math.min(160, w * 0.32)}px ${FONT}`
  ctx.fillStyle = '#ff6b35'
  ctx.fillText(String(streak), cx, y + Math.min(140, w * 0.28))
  y += Math.min(160, w * 0.32) + 8

  ctx.font = `700 22px ${FONT}`
  ctx.fillStyle = INK
  ctx.fillText('DAY STREAK', cx, y)
  y += 48

  ctx.font = `800 36px ${FONT}`
  ctx.fillStyle = INK
  ctx.fillText(String(total), cx, y)
  y += 8

  ctx.font = `600 12px ${FONT}`
  ctx.fillStyle = INK2
  ctx.letterSpacing = '1px'
  ctx.fillText('CATS CATALOGED', cx, y + 16)
  ctx.textAlign = 'left'

  const footerH = 80
  const footerY = h - footerH
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, footerY)
  ctx.lineTo(w - 40, footerY)
  ctx.stroke()

  ctx.font = `800 36px ${FONT}`
  ctx.fillStyle = INK
  ctx.fillText('Katalog', 50, footerY + 48)

  ctx.font = `400 13px ${FONT}`
  ctx.fillStyle = INK2
  ctx.textAlign = 'right'
  ctx.fillText("Cats I've met", w - 50, footerY + 46)
  ctx.textAlign = 'left'

  return canvas
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = word
      y += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
}
