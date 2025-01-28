import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { FiMapPin, FiTag, FiClock, FiDollarSign, FiStar } from 'react-icons/fi'
import LocationMap from '../components/LocationMap'

export default function TruckDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [truck, setTruck] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    images: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTruckAndReviews()
  }, [id])

  async function fetchTruckAndReviews() {
    try {
      // Fetch truck details
      const { data: truckData, error: truckError } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .single()

      if (truckError) throw truckError

      // Parse JSON fields
      const parsedTruck = {
        ...truckData,
        opening_hours: typeof truckData.opening_hours === 'string' 
          ? JSON.parse(truckData.opening_hours) 
          : truckData.opening_hours,
        recommended_menu: typeof truckData.recommended_menu === 'string'
          ? JSON.parse(truckData.recommended_menu)
          : truckData.recommended_menu
      }

      setTruck(parsedTruck)

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('truck_id', id)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError

      // Fetch user profiles for reviews
      const userIds = reviewsData.map(review => review.user_id)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Combine reviews with profiles
      const reviewsWithProfiles = reviewsData.map(review => ({
        ...review,
        profile: profilesData.find(profile => profile.id === review.user_id)
      }))

      setReviews(reviewsWithProfiles)
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนรีวิว')
      return
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            truck_id: id,
            user_id: user.id,
            rating: newReview.rating,
            comment: newReview.comment,
            images: newReview.images
          }
        ])

      if (error) throw error

      // Reset form and refresh reviews
      setNewReview({
        rating: 5,
        comment: '',
        images: []
      })
      fetchTruckAndReviews()
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการส่งรีวิว')
    }
  }

  function getOpeningHours(hours) {
    if (!hours) return null
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' })
    return hours[today]
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-red-600">เกิดข้อผิดพลาด: {error}</div>
    </div>
  )

  if (!truck) return (
    <div className="container mx-auto px-4 py-8">
      <div>ไม่พบข้อมูลร้านค้า</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96">
        <img
          src={truck.image_url}
          alt={truck.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-2">{truck.name}</h1>
            <div className="flex items-center text-white gap-4">
              <div className="flex items-center">
                <FiTag className="mr-2" />
                <span>{truck.cuisine_type}</span>
              </div>
              <div className="flex items-center">
                <FiDollarSign className="mr-2" />
                <span>{truck.price_range}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">เกี่ยวกับร้าน</h2>
              <p className="text-gray-600">{truck.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">เมนูแนะนำ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {truck.recommended_menu.map((menu, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <div className="font-medium text-lg">{menu.name}</div>
                    <div className="text-gray-600">{menu.description}</div>
                    <div className="text-primary font-medium mt-2">{menu.price} บาท</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">รีวิวจากลูกค้า</h2>
              {/* Review Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">คะแนน</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">ความคิดเห็น</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full p-2 border rounded"
                      rows="3"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
                    ส่งรีวิว
                  </button>
                </form>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <p className="text-yellow-800">กรุณาเข้าสู่ระบบเพื่อรีวิว</p>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={review.profile?.avatar_url || 'https://via.placeholder.com/40'}
                          alt={review.profile?.full_name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{review.profile?.full_name}</div>
                          <div className="text-gray-500 text-sm">
                            {new Date(review.created_at).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <FiStar key={i} className="fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="rounded-lg w-full h-32 object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold mb-3">เวลาเปิด-ปิด</h3>
              {Object.entries(truck.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between py-1">
                  <span className="capitalize">{day}</span>
                  <span>{hours.open} - {hours.close}</span>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold mb-3">ตำแหน่งร้าน</h3>
              <LocationMap
                latitude={truck.latitude}
                longitude={truck.longitude}
                className="h-48 mb-4 rounded-lg"
              />
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                <span>พิกัด: {truck.latitude}, {truck.longitude}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
