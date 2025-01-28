import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link } from 'react-router-dom'
import { FiCalendar, FiMapPin, FiDollarSign, FiTruck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEvents, setFilteredEvents] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchEvents()
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    if (searchQuery) {
      const filtered = events.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchQuery, events])

  async function fetchUserProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (name)
        `)
        .order('start_date', { ascending: true })

      if (error) throw error
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const isOrganizer = userProfile?.user_type === 'organizer'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">อีเว้นท์ทั้งหมด</h1>
        {isOrganizer && (
          <Link
            to="/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            สร้างอีเว้นท์
          </Link>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="ค้นหาอีเว้นท์..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <img
              src={event.image_url || 'https://via.placeholder.com/400x200'}
              alt={event.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <FiDollarSign className="mr-2" />
                  <span>{event.registration_fee} บาท</span>
                </div>
                <div className="flex items-center">
                  <FiTruck className="mr-2" />
                  <span>รับสมัครร้านค้า {event.max_trucks} ร้าน</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                จัดโดย: {event.profiles?.name || 'ไม่ระบุ'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          ไม่พบอีเว้นท์ที่คุณค้นหา
        </div>
      )}
    </div>
  )
}
