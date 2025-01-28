import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import EventForm from './EventForm'
import Swal from 'sweetalert2'
import { FiEdit2, FiTrash2, FiPlusCircle, FiTruck } from 'react-icons/fi'

const EventManagement = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [user])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_trucks(truck_id)')
        .eq('organizer_id', user.id)
        .order('start_date', { ascending: true })

      if (error) throw error

      setEvents(data.map(event => ({
        ...event,
        truck_count: event.event_trucks?.length || 0
      })))
    } catch (error) {
      console.error('Error fetching events:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดรายการอีเวนต์ได้',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบอีเวนต์นี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    })

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)

        if (error) throw error

        setEvents(events.filter(event => event.id !== eventId))
        
        Swal.fire({
          icon: 'success',
          title: 'ลบอีเวนต์สำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        })
      } catch (error) {
        console.error('Error deleting event:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบอีเวนต์ได้',
        })
      }
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleFormSubmit = () => {
    fetchEvents()
    setShowForm(false)
    setEditingEvent(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">จัดการอีเวนต์</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlusCircle /> สร้างอีเวนต์ใหม่
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingEvent ? 'แก้ไขอีเวนต์' : 'สร้างอีเวนต์ใหม่'}
            </h3>
            <EventForm
              event={editingEvent}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingEvent(null)
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-soft overflow-hidden"
          >
            <img
              src={event.image_url || 'https://via.placeholder.com/300x200'}
              alt={event.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiTruck />
                  <span>
                    {event.truck_count} / {event.max_trucks} ร้านค้า
                  </span>
                </div>
                <div className="text-primary font-medium">
                  ค่าลงทะเบียน: ฿{event.registration_fee.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  {new Date(event.start_date).toLocaleDateString('th-TH')} -{' '}
                  {new Date(event.end_date).toLocaleDateString('th-TH')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-center text-gray-500">ยังไม่มีอีเวนต์</p>
      )}
    </div>
  )
}

export default EventManagement
