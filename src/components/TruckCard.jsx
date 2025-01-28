import { Link } from 'react-router-dom'
import { FiStar, FiMapPin } from 'react-icons/fi'

const TruckCard = ({ truck }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <img
        src={truck.image_url || 'https://via.placeholder.com/300x200'}
        alt={truck.name}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{truck.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{truck.description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-400" />
            <span>{truck.average_rating || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FiMapPin />
            <span className="line-clamp-1">{truck.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-primary font-medium">{truck.category}</span>
          <Link to={`/truck/${truck.id}`} className="btn-primary">
            ดูเพิ่มเติม
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TruckCard
