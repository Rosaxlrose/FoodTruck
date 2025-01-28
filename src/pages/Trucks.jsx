import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { FiSearch, FiMapPin, FiTag, FiClock, FiDollarSign, FiStar } from 'react-icons/fi'

export default function Trucks() {
  const [trucks, setTrucks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTrucks, setFilteredTrucks] = useState([])
  const [filters, setFilters] = useState({
    cuisine: 'all',
    priceRange: 'all',
    category: 'all'
  })

  useEffect(() => {
    fetchTrucks()
  }, [])

  useEffect(() => {
    filterTrucks()
  }, [searchQuery, trucks, filters])

  async function fetchTrucks() {
    try {
      // Fetch trucks with their reviews
      const { data, error } = await supabase
        .from('trucks')
        .select(`
          *,
          reviews (
            rating
          )
        `)
      if (error) throw error
      
      // Parse JSON fields and calculate average rating
      const parsedData = data.map(truck => ({
        ...truck,
        opening_hours: typeof truck.opening_hours === 'string' ? JSON.parse(truck.opening_hours) : truck.opening_hours,
        recommended_menu: typeof truck.recommended_menu === 'string' ? JSON.parse(truck.recommended_menu) : truck.recommended_menu,
        averageRating: truck.reviews.length > 0 
          ? truck.reviews.reduce((acc, review) => acc + review.rating, 0) / truck.reviews.length
          : 0,
        reviewCount: truck.reviews.length
      }))
      
      setTrucks(parsedData)
      setFilteredTrucks(parsedData)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function filterTrucks() {
    let filtered = [...trucks]

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(truck => 
        truck.name.toLowerCase().includes(query) ||
        truck.description.toLowerCase().includes(query) ||
        truck.category.toLowerCase().includes(query) ||
        truck.cuisine_type.toLowerCase().includes(query) ||
        truck.recommended_menu.some(menu => 
          menu.name.toLowerCase().includes(query) ||
          menu.description.toLowerCase().includes(query)
        )
      )
    }

    // Cuisine filter
    if (filters.cuisine !== 'all') {
      filtered = filtered.filter(truck => 
        truck.cuisine_type === filters.cuisine
      )
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(truck => 
        truck.price_range === filters.priceRange
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(truck => 
        truck.category === filters.category
      )
    }

    setFilteredTrucks(filtered)
  }

  function getOpeningHours(hours) {
    if (!hours) return null
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' })
    return hours[today]
  }

  // Get unique values for filters
  const cuisineTypes = ['all', ...new Set(trucks.map(t => t.cuisine_type))]
  const priceRanges = ['all', ...new Set(trucks.map(t => t.price_range))]
  const categories = ['all', ...new Set(trucks.map(t => t.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">ค้นหา Food Truck</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาร้านค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/90 text-gray-900"
              />
            </div>
            <select
              value={filters.cuisine}
              onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
              className="rounded-lg bg-white/90 text-gray-900 py-2 px-4"
            >
              {cuisineTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'ประเภทอาหารทั้งหมด' : type}
                </option>
              ))}
            </select>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="rounded-lg bg-white/90 text-gray-900 py-2 px-4"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>
                  {range === 'all' ? 'ช่วงราคาทั้งหมด' : range}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="rounded-lg bg-white/90 text-gray-900 py-2 px-4"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'หมวดหมู่ทั้งหมด' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trucks Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrucks.map((truck) => (
            <div key={truck.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={truck.image_url}
                alt={truck.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{truck.name}</h3>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-1">
                      {Array.from({ length: Math.round(truck.averageRating) }).map((_, i) => (
                        <FiStar key={i} className="fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({truck.reviewCount})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <FiTag className="flex-shrink-0" />
                  <span>{truck.cuisine_type}</span>
                  <span className="mx-2">•</span>
                  <FiDollarSign className="flex-shrink-0" />
                  <span>{truck.price_range}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{truck.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    <span>
                      {getOpeningHours(truck.opening_hours)?.open} - {getOpeningHours(truck.opening_hours)?.close}
                    </span>
                  </div>
                  <Link
                    to={`/trucks/${truck.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ดูเพิ่มเติม
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
