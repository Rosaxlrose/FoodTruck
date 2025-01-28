import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { FiTruck, FiStar, FiUsers, FiCalendar } from 'react-icons/fi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Analytics = ({ truckId }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    averageRating: 0,
    totalReviews: 0,
    totalViews: 0,
  })
  const [reviewData, setReviewData] = useState({
    labels: [],
    datasets: [],
  })
  const [eventData, setEventData] = useState({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    if (user && truckId) {
      fetchAnalytics()
    }
  }, [user, truckId])

  const fetchAnalytics = async () => {
    try {
      // Fetch basic stats
      const { data: statsData, error: statsError } = await supabase
        .from('trucks')
        .select(`
          id,
          events:event_trucks(count),
          reviews:truck_reviews(
            rating,
            created_at
          )
        `)
        .eq('id', truckId)
        .single()

      if (statsError) throw statsError

      // Calculate stats
      const reviews = statsData.reviews || []
      const averageRating = reviews.length > 0
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        : 0

      setStats({
        totalEvents: statsData.events.length,
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews.length,
        totalViews: Math.floor(Math.random() * 1000), // Mock data for views
      })

      // Prepare review data by month
      const monthlyReviews = reviews.reduce((acc, review) => {
        const month = new Date(review.created_at).toLocaleString('th-TH', { month: 'short' })
        if (!acc[month]) acc[month] = { count: 0, total: 0 }
        acc[month].count++
        acc[month].total += review.rating
        return acc
      }, {})

      const labels = Object.keys(monthlyReviews)
      const averages = labels.map(month => 
        monthlyReviews[month].total / monthlyReviews[month].count
      )
      const counts = labels.map(month => monthlyReviews[month].count)

      setReviewData({
        labels,
        datasets: [
          {
            label: 'คะแนนเฉลี่ย',
            data: averages,
            borderColor: '#2EC4B6',
            backgroundColor: 'rgba(46, 196, 182, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'จำนวนรีวิว',
            data: counts,
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.5)',
            yAxisID: 'y1',
            type: 'bar',
          },
        ],
      })

      // Fetch event participation data
      const { data: eventData, error: eventError } = await supabase
        .from('event_trucks')
        .select(`
          events (
            name,
            start_date,
            registration_fee
          )
        `)
        .eq('truck_id', truckId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (eventError) throw eventError

      const events = eventData.map(e => e.events)
      setEventData({
        labels: events.map(e => e.name),
        datasets: [
          {
            label: 'ค่าลงทะเบียน (บาท)',
            data: events.map(e => e.registration_fee),
            backgroundColor: 'rgba(46, 196, 182, 0.5)',
            borderColor: '#2EC4B6',
          },
        ],
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600">อีเวนต์ทั้งหมด</p>
              <p className="text-2xl font-semibold">{stats.totalEvents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-50 text-secondary-600 rounded-full">
              <FiStar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600">คะแนนเฉลี่ย</p>
              <p className="text-2xl font-semibold">{stats.averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600">รีวิวทั้งหมด</p>
              <p className="text-2xl font-semibold">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-50 text-secondary-600 rounded-full">
              <FiTruck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600">ยอดเข้าชม</p>
              <p className="text-2xl font-semibold">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Chart */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold mb-4">สถิติรีวิวรายเดือน</h3>
        <Line
          data={reviewData}
          options={{
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'คะแนนเฉลี่ย',
                },
                min: 0,
                max: 5,
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'จำนวนรีวิว',
                },
                min: 0,
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          }}
        />
      </div>

      {/* Event Chart */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold mb-4">ค่าลงทะเบียนอีเวนต์ล่าสุด</h3>
        <Bar
          data={eventData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default Analytics
