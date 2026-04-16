export async function getCurrentLocation() {
  if (!navigator.geolocation) throw new Error('Geolocation not supported')
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  })
}

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Reverse geocode failed')
  const data = await res.json()
  const a = data.address || {}
  const neighborhood = a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.village || a.town
  const city = a.city || a.town || a.village || a.municipality || a.county
  if (neighborhood && city && neighborhood !== city) return `${neighborhood}, ${city}`
  return city || neighborhood || a.state || 'Unknown'
}
