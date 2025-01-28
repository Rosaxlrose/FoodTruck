import { useEffect, useRef } from 'react'
import { FiExternalLink } from 'react-icons/fi'

export default function LocationMap({ latitude, longitude, className }) {
  const mapRef = useRef(null)
  const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) }

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initMap = () => {
    if (mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
      })

      new window.google.maps.Marker({
        position: location,
        map: map,
      })
    }
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg"></div>
      <button
        onClick={openInGoogleMaps}
        className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
        title="เปิดใน Google Maps"
      >
        <FiExternalLink className="text-gray-600" />
      </button>
    </div>
  )
}
