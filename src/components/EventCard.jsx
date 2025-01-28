import { Link } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiTruck } from 'react-icons/fi'

const EventCard = ({ event }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <img
        src={event.image_url || 'https://via.placeholder.com/300x200'}
        alt={event.name}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FiCalendar />
            <span>
              {new Date(event.start_date).toLocaleDateString('th-TH')} -{' '}
              {new Date(event.end_date).toLocaleDateString('th-TH')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FiMapPin />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FiTruck />
            <span>{event.truck_count || 0} ร้านค้า</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to={`/event/${event.id}`} className="btn-secondary">
            ดูเพิ่มเติม
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EventCard
