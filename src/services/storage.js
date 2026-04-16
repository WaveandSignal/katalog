import { openDB } from 'idb'

const DB_NAME = 'katalog'
const DB_VERSION = 1
const ENTRIES_STORE = 'entries'
const PHOTOS_STORE = 'photos'
const META_STORE = 'meta'

let dbPromise

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
          const s = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' })
          s.createIndex('timestamp', 'timestamp')
        }
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          db.createObjectStore(PHOTOS_STORE)
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE)
        }
      },
    })
  }
  return dbPromise
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function savePhoto(blob) {
  const db = await getDB()
  const ref = uuid()
  await db.put(PHOTOS_STORE, blob, ref)
  return ref
}

export async function getPhoto(ref) {
  if (!ref) return null
  const db = await getDB()
  return db.get(PHOTOS_STORE, ref)
}

export async function deletePhoto(ref) {
  if (!ref) return
  const db = await getDB()
  await db.delete(PHOTOS_STORE, ref)
}

export async function saveEntry(entry) {
  const db = await getDB()
  const now = new Date().toISOString()
  const record = {
    id: entry.id ?? uuid(),
    photoRef: entry.photoRef ?? null,
    timestamp: entry.timestamp ?? now,
    latitude: entry.latitude ?? null,
    longitude: entry.longitude ?? null,
    locationDisplay: entry.locationDisplay ?? null,
    nickname: entry.nickname ?? null,
    notes: entry.notes ?? null,
    createdAt: entry.createdAt ?? now,
    updatedAt: now,
  }
  await db.put(ENTRIES_STORE, record)
  return record
}

export async function updateEntry(id, updates) {
  const db = await getDB()
  const existing = await db.get(ENTRIES_STORE, id)
  if (!existing) throw new Error('Entry not found')
  const record = { ...existing, ...updates, id, updatedAt: new Date().toISOString() }
  await db.put(ENTRIES_STORE, record)
  return record
}

export async function getEntries(filters = {}) {
  const db = await getDB()
  let entries = await db.getAllFromIndex(ENTRIES_STORE, 'timestamp')
  entries.reverse()
  if (filters.nickname) {
    const q = filters.nickname.toLowerCase()
    entries = entries.filter(e => e.nickname && e.nickname.toLowerCase().includes(q))
  }
  if (filters.fromDate) {
    entries = entries.filter(e => e.timestamp >= filters.fromDate)
  }
  if (filters.toDate) {
    entries = entries.filter(e => e.timestamp <= filters.toDate)
  }
  return entries
}

export async function getEntryById(id) {
  const db = await getDB()
  return db.get(ENTRIES_STORE, id)
}

export async function deleteEntry(id) {
  const db = await getDB()
  const entry = await db.get(ENTRIES_STORE, id)
  if (entry?.photoRef) await deletePhoto(entry.photoRef)
  await db.delete(ENTRIES_STORE, id)
}

function localDayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getStats() {
  const entries = await getEntries()
  if (entries.length === 0) {
    return {
      total: 0,
      currentStreak: 0,
      longestStreak: 0,
      uniqueNicknames: 0,
      daysActive: 0,
      topLocation: null,
      dayCounts: {},
      loggedToday: false,
    }
  }
  const dayCounts = {}
  const nicknames = new Set()
  const locationCounts = {}
  for (const e of entries) {
    const key = localDayKey(e.timestamp)
    dayCounts[key] = (dayCounts[key] || 0) + 1
    if (e.nickname && e.nickname.trim()) nicknames.add(e.nickname.trim().toLowerCase())
    if (e.locationDisplay) locationCounts[e.locationDisplay] = (locationCounts[e.locationDisplay] || 0) + 1
  }
  const days = Object.keys(dayCounts).sort()
  const daysActive = days.length

  let longest = 0, current = 0, prev = null
  for (const d of days) {
    if (prev) {
      const diff = Math.round((new Date(d) - new Date(prev)) / 86400000)
      current = diff === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    if (current > longest) longest = current
    prev = d
  }

  const today = localDayKey(new Date().toISOString())
  const yesterday = localDayKey(new Date(Date.now() - 86400000).toISOString())
  let currentStreak = 0
  if (dayCounts[today] || dayCounts[yesterday]) {
    let cursor = dayCounts[today] ? new Date(today) : new Date(yesterday)
    while (dayCounts[localDayKey(cursor.toISOString())]) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const uniqueNeighborhoods = Object.keys(locationCounts).length

  return {
    total: entries.length,
    currentStreak,
    longestStreak: longest,
    uniqueNicknames: nicknames.size,
    daysActive,
    topLocation,
    uniqueNeighborhoods,
    dayCounts,
    loggedToday: !!dayCounts[today],
  }
}

export async function getMeta(key) {
  const db = await getDB()
  return db.get(META_STORE, key)
}

export async function setMeta(key, value) {
  const db = await getDB()
  await db.put(META_STORE, value, key)
}
