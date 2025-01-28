import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link } from 'react-router-dom'
import { FiSearch, FiMapPin, FiX, FiCalendar, FiClock, FiTag, FiDollarSign } from 'react-icons/fi'
import LocationMap from '../components/LocationMap'

export default function Home() {
  const [trucks, setTrucks] = useState([])
  const [events, setEvents] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTrucks, setFilteredTrucks] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])

  useEffect(() => {
    fetchTrucksAndEvents()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      const matchedTrucks = trucks.filter(truck => 
        truck.name.toLowerCase().includes(lowerQuery) ||
        truck.description.toLowerCase().includes(lowerQuery) ||
        truck.category.toLowerCase().includes(lowerQuery) ||
        truck.cuisine_type.toLowerCase().includes(lowerQuery) ||
        getRecommendedMenu(truck.recommended_menu).some(menu => 
          menu.name.toLowerCase().includes(lowerQuery) ||
          menu.description.toLowerCase().includes(lowerQuery)
        )
      )
      const matchedEvents = events.filter(event =>
        event.name.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery)
      )
      setFilteredTrucks(matchedTrucks)
      setFilteredEvents(matchedEvents)
    } else {
      setFilteredTrucks(trucks)
      setFilteredEvents(events)
    }
  }, [searchQuery, trucks, events])

  async function fetchTrucksAndEvents() {
    try {
      const { data: trucksData, error: trucksError } = await supabase
        .from('trucks')
        .select('*')
      if (trucksError) throw trucksError
      
      // Parse JSON fields before setting state
      const parsedTrucksData = trucksData.map(truck => ({
        ...truck,
        opening_hours: typeof truck.opening_hours === 'string' ? JSON.parse(truck.opening_hours) : truck.opening_hours,
        recommended_menu: typeof truck.recommended_menu === 'string' ? JSON.parse(truck.recommended_menu) : truck.recommended_menu
      }))
      
      setTrucks(parsedTrucksData)
      setFilteredTrucks(parsedTrucksData)

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(3)
      if (eventsError) throw eventsError
      setEvents(eventsData)
      setFilteredEvents(eventsData)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getOpeningHours(hours) {
    if (!hours) return null
    try {
      const openingHours = typeof hours === 'string' ? JSON.parse(hours) : hours
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' })
      return openingHours[today]
    } catch (error) {
      console.error('Error parsing opening hours:', error)
      return null
    }
  }

  function getRecommendedMenu(menu) {
    if (!menu) return []
    try {
      return typeof menu === 'string' ? JSON.parse(menu) : menu
    } catch (error) {
      console.error('Error parsing recommended menu:', error)
      return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ค้นหา Food Truck ที่คุณชื่นชอบ
          </h1>
          <p className="text-xl mb-8">
            ค้นพบร้านอาหารและอีเวนต์ที่น่าสนใจใกล้คุณ
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาร้านค้า, อีเว้นท์, ประเภทอาหาร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="btn-secondary flex items-center justify-center gap-2 py-3 px-6">
              <FiMapPin />
              ค้นหาใกล้ฉัน
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Food Trucks Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ร้านค้าแนะนำ</h2>
            <Link to="/trucks" className="text-blue-600 hover:text-blue-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrucks.map((truck) => (
              <div key={truck.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={truck.image_url || 'https://via.placeholder.com/400x200'}
                  alt={truck.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{truck.name}</h3>
                    <span className="text-sm text-gray-500">{truck.price_range}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{truck.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiTag className="mr-1" />
                      <span>{truck.cuisine_type}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(truck)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ดูเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">อีเว้นท์ที่กำลังจะมาถึง</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={event.image_url || 'https://via.placeholder.com/400x200'}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(event)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ดูเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  {selectedItem.cuisine_type && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FiTag className="mr-1" />
                      <span>{selectedItem.cuisine_type}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <img
                src={selectedItem.image_url || 'https://via.placeholder.com/800x400'}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />

              <div className="space-y-4">
                <p className="text-gray-600">{selectedItem.description}</p>

                {/* Truck-specific information */}
                {selectedItem.category && (
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-2" />
                      <span>เวลาเปิด-ปิด: {getOpeningHours(selectedItem.opening_hours)?.open} - {getOpeningHours(selectedItem.opening_hours)?.close} น.</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-2" />
                      <span>ช่วงราคา: {selectedItem.price_range}</span>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">เมนูแนะนำ</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {getRecommendedMenu(selectedItem.recommended_menu).map((menu, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="font-medium">{menu.name}</div>
                            <div className="text-sm text-gray-500">{menu.description}</div>
                            <div className="text-sm font-medium text-blue-600">{menu.price} บาท</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">ตำแหน่งร้าน</h3>
                      <LocationMap
                        latitude={selectedItem.latitude}
                        longitude={selectedItem.longitude}
                        className="h-48 mb-4"
                      />
                    </div>
                  </div>
                )}

                {/* Event-specific information */}
                {!selectedItem.category && (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-2" />
                      <div>
                        <div>เริ่ม: {formatDate(selectedItem.start_date)}</div>
                        <div>สิ้นสุด: {formatDate(selectedItem.end_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="mr-2" />
                      <span>{selectedItem.location}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Link
                    to={`/${selectedItem.category ? 'trucks' : 'events'}/${selectedItem.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ดูรายละเอียดเพิ่มเติม
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
