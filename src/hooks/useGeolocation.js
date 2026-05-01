import { useEffect, useState } from 'react'

const useGeolocation = () => {
  const hasGeolocation = typeof navigator !== 'undefined' && !!navigator.geolocation
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(hasGeolocation ? null : 'Geolocation is not supported by your browser')

  useEffect(() => {
    if (!hasGeolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => setError('Location permission denied'),
    )
  }, [hasGeolocation])

  return { coords, error }
}

export default useGeolocation
