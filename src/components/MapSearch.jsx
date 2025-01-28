import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '../utils/supabaseClient'
import { FiSearch, FiMapPin } from 'react-icons/fi'

const libraries = ['places']
const mapContainerStyle = {
  width: '100%',
  height: '500px',
}
const options = {
  disableDefaultUI: true,
  zoomControl: true,
}
const center = {
  lat: 13.7563,
  lng: 100.5018,
}

const MapSearch = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [markers, setMarkers] = useState([])
  const [selected, setSelected] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const mapRef = useRef()
  const searchBoxRef = useRef()

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    // Initialize search box
    const input = document.getElementById('search-input')
    searchBoxRef.current = new window.google.maps.places.SearchBox(input)
    
    // Listen for search box changes
    searchBoxRef.current.addListener('places_changed', () => {
      const places = searchBoxRef.current.getPlaces()
      if (places.length === 0) return

      const bounds = new window.google.maps.LatLngBounds()
      places.forEach(place => {
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport)
        } else {
          bounds.extend(place.geometry.location)
        }
      })
      mapRef.current.fitBounds(bounds)
    })
  }, [])

  const fetchNearbyTrucks = async (lat, lng, radius = 5000) => {
    try {
      const { data, error } = await supabase
        .rpc('nearby_trucks', {
          latitude: lat,
          longitude: lng,
          radius_meters: radius,
        })

      if (error) throw error

      setMarkers(data.map(truck => ({
        ...truck,
        lat: parseFloat(truck.latitude),
        lng: parseFloat(truck.longitude),
      })))
    } catch (error) {
      console.error('Error fetching nearby trucks:', error)
    }
  }

  const handleMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    await fetchNearbyTrucks(lat, lng)
  }, [])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading maps...</div>

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="search-input"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="ค้นหาสถานที่..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-soft">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          options={options}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => setSelected(marker)}
              icon={{
                url: '/src/assets/food-truck-marker.svg',
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="p-2">
                <h3 className="font-semibold">{selected.name}</h3>
                <p className="text-sm text-gray-600">{selected.description}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiMapPin className="mr-1" />
                  <span>{selected.address}</span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  )
}

export default MapSearch
