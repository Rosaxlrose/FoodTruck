import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { FiCalendar, FiMapPin, FiDollarSign, FiTruck, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [registeredTrucks, setRegisteredTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchEvent()
    if (user) {
      fetchUserProfile()
    }
  }, [id, user])

  async function fetchEvent() {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (name)
        `)
        .eq('id', id)
        .single()

      if (eventError) throw eventError

      const { data: trucksData, error: trucksError } = await supabase
        .from('event_trucks')
        .select(`
          trucks (
            id,
            name,
            description,
            image_url,
            owner_id
          )
        `)
        .eq('event_id', id)

      if (trucksError) throw trucksError

      setEvent(eventData)
      setRegisteredTrucks(trucksData.map(t => t.trucks))
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function handleRegister() {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนสมัครเข้าร่วมอีเว้นท์')
      navigate('/login')
      return
    }

    if (!userProfile || userProfile.user_type !== 'owner') {
      alert('เฉพาะเจ้าของร้านเท่านั้นที่สามารถสมัครเข้าร่วมอีเว้นท์ได้')
      return
    }

    try {
      // Get user's truck
      const { data: trucks, error: trucksError } = await supabase
        .from('trucks')
        .select('id')
        .eq('owner_id', user.id)

      if (trucksError) throw trucksError
      if (!trucks.length) {
        alert('คุณยังไม่มีร้านค้า กรุณาสร้างร้านค้าก่อน')
        navigate('/trucks/create')
        return
      }

      // Register truck for event
      const { error: registerError } = await supabase
        .from('event_trucks')
        .insert([
          {
            event_id: id,
            truck_id: trucks[0].id
          }
        ])

      if (registerError) throw registerError

      alert('สมัครเข้าร่วมอีเว้นท์สำเร็จ!')
      fetchEvent()
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleDelete() {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบอีเว้นท์นี้?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('ลบอีเว้นท์สำเร็จ')
      navigate('/events')
    } catch (error) {
      alert(error.message)
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่พบอีเว้นท์</h1>
          <p className="text-gray-600">อีเว้นท์นี้อาจถูกลบไปแล้ว หรือ URL ไม่ถูกต้อง</p>
        </div>
      </div>
    )
  }

  const isOrganizer = user?.id === event.organizer_id
  const isTruckRegistered = registeredTrucks.some(truck => truck.owner_id === user?.id)
  const isEventFull = registeredTrucks.length >= event.max_trucks

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={event.image_url || 'https://via.placeholder.com/800x400'}
            alt={event.name}
            className="w-full h-64 object-cover"
          />

          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
              {isOrganizer && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/events/${id}/edit`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                <div>
                  <div>เริ่ม: {formatDate(event.start_date)}</div>
                  <div>สิ้นสุด: {formatDate(event.end_date)}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                <span>{event.location}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <FiDollarSign className="mr-2" />
                <span>ค่าสมัคร: {event.registration_fee} บาท</span>
              </div>

              <div className="flex items-center text-gray-600">
                <FiTruck className="mr-2" />
                <span>
                  ร้านค้าที่เข้าร่วม: {registeredTrucks.length}/{event.max_trucks}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                จัดโดย: {event.profiles?.name || 'ไม่ระบุ'}
              </p>
            </div>

            {!isOrganizer && (
              <div className="flex justify-center">
                <button
                  onClick={handleRegister}
                  disabled={isTruckRegistered || isEventFull}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isTruckRegistered
                    ? 'คุณได้สมัครเข้าร่วมแล้ว'
                    : isEventFull
                    ? 'อีเว้นท์เต็มแล้ว'
                    : 'สมัครเข้าร่วม'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">ร้านค้าที่เข้าร่วม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredTrucks.map((truck) => (
              <div
                key={truck.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={truck.image_url || 'https://via.placeholder.com/300x200'}
                  alt={truck.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{truck.name}</h3>
                  <p className="text-gray-600 text-sm">{truck.description}</p>
                </div>
              </div>
            ))}
          </div>

          {registeredTrucks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีร้านค้าเข้าร่วม
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
