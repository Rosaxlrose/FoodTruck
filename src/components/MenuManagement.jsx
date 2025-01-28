import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import MenuForm from './MenuForm'
import Swal from 'sweetalert2'
import { FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi'

const MenuManagement = ({ truckId }) => {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    fetchMenuItems()
  }, [truckId])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('truck_id', truckId)
        .order('name')

      if (error) throw error

      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดรายการเมนูได้',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?',
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
          .from('menu_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error

        setMenuItems(menuItems.filter(item => item.id !== itemId))
        
        Swal.fire({
          icon: 'success',
          title: 'ลบเมนูสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        })
      } catch (error) {
        console.error('Error deleting menu item:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบเมนูได้',
        })
      }
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleFormSubmit = () => {
    fetchMenuItems()
    setShowForm(false)
    setEditingItem(null)
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
        <h2 className="text-2xl font-semibold">จัดการเมนู</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlusCircle /> เพิ่มเมนูใหม่
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
            </h3>
            <MenuForm
              truckId={truckId}
              item={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingItem(null)
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-soft overflow-hidden"
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
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    item.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.available ? 'พร้อมเสิร์ฟ' : 'หมด'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
    </div>
  )
}

export default MenuManagement
