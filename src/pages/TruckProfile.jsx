import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import MenuManagement from '../components/MenuManagement'
import ReviewForm from '../components/ReviewForm'
import ReviewList from '../components/ReviewList'
import Loading from '../components/Loading'
import { FiMapPin, FiPhone, FiMail, FiStar } from 'react-icons/fi'

const TruckProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [truck, setTruck] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('menu')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchTruckData()
    fetchReviews()
  }, [id])

  const fetchTruckData = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTruck(data)
      setIsOwner(user?.id === data.owner_id)
    } catch (error) {
      console.error('Error fetching truck:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('truck_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  if (loading) return <Loading />

  if (!truck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">ไม่พบข้อมูลร้านค้า</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-8">
        <div className="relative h-64">
          <img
            src={truck.image_url || 'https://via.placeholder.com/1200x400'}
            alt={truck.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{truck.name}</h1>
          <p className="text-gray-600 mb-6">{truck.description}</p>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <FiMapPin />
              <span>{truck.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone />
              <span>{truck.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMail />
              <span>{truck.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-400" />
              <span>{truck.average_rating || '0.0'} ({reviews.length} รีวิว)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'menu'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('menu')}
        >
          เมนู
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'reviews'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          รีวิว
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        {activeTab === 'menu' && (
          isOwner ? (
            <MenuManagement truckId={id} />
          ) : (
            <div>แสดงเมนูสำหรับลูกค้า</div>
          )
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <ReviewForm truckId={id} onReviewSubmitted={fetchReviews} />
            <ReviewList reviews={reviews} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TruckProfile
