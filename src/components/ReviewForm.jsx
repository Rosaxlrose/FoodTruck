import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import Swal from 'sweetalert2'

const ReviewForm = ({ truckId, onReviewSubmitted }) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนรีวิว',
      })
      return
    }

    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาให้คะแนน',
        text: 'คุณต้องให้คะแนนอย่างน้อย 1 ดาว',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          truck_id: truckId,
          user_id: user.id,
          rating,
          comment,
          created_at: new Date(),
        },
      ])

      if (error) throw error

      setRating(0)
      setComment('')
      
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }

      Swal.fire({
        icon: 'success',
        title: 'ขอบคุณสำหรับรีวิว!',
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error submitting review:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ให้คะแนน
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ความคิดเห็น
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="เขียนรีวิวของคุณ..."
          className="input w-full"
          rows="4"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !user}
          className="btn-primary w-full flex justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            'ส่งรีวิว'
          )}
        </button>
        {!user && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            กรุณาเข้าสู่ระบบเพื่อรีวิว
          </p>
        )}
      </div>
    </form>
  )
}

export default ReviewForm
