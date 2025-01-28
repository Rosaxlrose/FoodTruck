import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FiUpload, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'

const MenuForm = ({ truckId, item = null, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image_url: item?.image_url || '',
    available: item?.available ?? true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(formData.image_url)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${truckId}/${Date.now()}.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let image_url = formData.image_url
      if (imageFile) {
        image_url = await uploadImage()
      }

      const menuData = {
        truck_id: truckId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url,
        available: formData.available,
      }

      if (item) {
        // Update existing menu item
        const { error } = await supabase
          .from('menu_items')
          .update(menuData)
          .eq('id', item.id)

        if (error) throw error
      } else {
        // Create new menu item
        const { error } = await supabase
          .from('menu_items')
          .insert([menuData])

        if (error) throw error
      }

      Swal.fire({
        icon: 'success',
        title: item ? 'อัปเดตเมนูสำเร็จ' : 'เพิ่มเมนูสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      })

      if (onSubmit) {
        onSubmit()
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-full max-w-md aspect-video">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">ไม่มีรูปภาพ</span>
            </div>
          )}
          <label className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
            <FiUpload />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อเมนู
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รายละเอียด
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ราคา (บาท)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label className="ml-2 text-sm text-gray-700">พร้อมเสิร์ฟ</label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <FiX /> ยกเลิก
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            item ? 'อัปเดตเมนู' : 'เพิ่มเมนู'
          )}
        </button>
      </div>
    </form>
  )
}

export default MenuForm
