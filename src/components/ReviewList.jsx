const ReviewList = ({ reviews }) => {
  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">ยังไม่มีรีวิว</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <img
                src={review.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                alt={review.profiles?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{review.profiles?.name || 'ผู้ใช้ทั่วไป'}</h4>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <span key={i} className="text-gray-300">★</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{review.comment}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ReviewList
