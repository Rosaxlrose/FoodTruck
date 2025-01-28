import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FiSearch } from 'react-icons/fi'

const MenuList = ({ truckId }) => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchMenuItems()
  }, [truckId])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('truck_id', truckId)
        .eq('available', true)
        .order('name')

      if (error) throw error

      setMenuItems(data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))]
      setCategories(['all', ...uniqueCategories.filter(Boolean)])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'ทุกหมวดหมู่' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={item.image_url || 'https://via.placeholder.com/300x200'}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-primary font-medium">
                  ฿{item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              {item.category && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500">ไม่พบเมนูที่ค้นหา</p>
      )}
    </div>
  )
}

export default MenuList
