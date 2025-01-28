import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import EventManagement from '../components/EventManagement'
import Loading from '../components/Loading'
import { FiMapPin, FiCalendar, FiTruck, FiDollarSign } from 'react-icons/fi'
import Swal from 'sweetalert2'

const EventProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [registeredTrucks, setRegisteredTrucks] = useState([])
  const [userTruck, setUserTruck] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    fetchEventData()
    if (user) {
      fetchUserTruck()
    }
  }, [id, user])

  const fetchEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_trucks(truck_id, trucks(*))')
        .eq('id', id)
        .single()

      if (error) throw error

      setEvent(data)
      setIsOrganizer(user?.id === data.organizer_id)
      setRegisteredTrucks(data.event_trucks.map(et => et.trucks))
      setIsRegistered(data.event_trucks.some(et => et.trucks.owner_id === user?.id))
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTruck = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (error) throw error

      setUserTruck(data)
    } catch (error) {
      console.error('Error fetching user truck:', error)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนลงทะเบียนอีเวนต์',
      })
      return
    }

    if (!userTruck) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูลร้านค้า',
        text: 'คุณต้องลงทะเบียนร้านค้าก่อนเข้าร่วมอีเวนต์',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('event_trucks')
        .insert([
          {
            event_id: id,
            truck_id: userTruck.id,
          },
        ])

      if (error) throw error

      Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ',
        text: 'คุณได้ลงทะเบียนเข้าร่วมอีเวนต์เรียบร้อยแล้ว',
      })

      fetchEventData()
    } catch (error) {
      console.error('Error registering for event:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลงทะเบียนได้',
      })
    }
  }

  const handleUnregister = async () => {
    try {
      const { error } = await supabase
        .from('event_trucks')
        .delete()
        .eq('event_id', id)
        .eq('truck_id', userTruck.id)

      if (error) throw error

      Swal.fire({
        icon: 'success',
        title: 'ยกเลิกการลงทะเบียนสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      })

      fetchEventData()
    } catch (error) {
      console.error('Error unregistering from event:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถยกเลิกการลงทะเบียนได้',
      })
    }
  }

  if (loading) return <Loading />

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">ไม่พบข้อมูลอีเวนต์</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-8">
        <div className="relative h-64">
          <img
            src={event.image_url || 'https://via.placeholder.com/1200x400'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
          <p className="text-gray-600 mb-6">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FiCalendar />
              <span>
                {new Date(event.start_date).toLocaleDateString('th-TH')} -{' '}
                {new Date(event.end_date).toLocaleDateString('th-TH')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiTruck />
              <span>
                {registeredTrucks.length} / {event.max_trucks} ร้านค้า
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiDollarSign />
              <span>ค่าลงทะเบียน: ฿{event.registration_fee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Button */}
      {!isOrganizer && userTruck && (
        <div className="flex justify-center mb-8">
          {isRegistered ? (
            <button
              onClick={handleUnregister}
              className="btn-secondary"
            >
              ยกเลิกการลงทะเบียน
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registeredTrucks.length >= event.max_trucks}
              className="btn-primary"
            >
              {registeredTrucks.length >= event.max_trucks
                ? 'อีเวนต์เต็มแล้ว'
                : 'ลงทะเบียนเข้าร่วม'}
            </button>
          )}
        </div>
      )}

      {/* Registered Trucks */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-2xl font-semibold mb-6">ร้านค้าที่เข้าร่วม</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registeredTrucks.map((truck) => (
            <div
              key={truck.id}
              className="bg-white rounded-xl shadow-soft overflow-hidden"
            >
              <img
                src={truck.image_url || 'https://via.placeholder.com/300x200'}
                alt={truck.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{truck.name}</h3>
                <p className="text-gray-600 line-clamp-2">{truck.description}</p>
              </div>
            </div>
          ))}
        </div>
        {registeredTrucks.length === 0 && (
          <p className="text-center text-gray-500">ยังไม่มีร้านค้าเข้าร่วม</p>
        )}
      </div>
      {isOrganizer && <EventManagement event={event} />}
    </div>
  )
}

export default EventProfile
