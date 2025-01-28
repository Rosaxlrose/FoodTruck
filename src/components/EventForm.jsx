import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FiUpload, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'

const EventForm = ({ event = null, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    location: event?.location || '',
    start_date: event?.start_date ? new Date(event.start_date).toISOString().split('T')[0] : '',
    end_date: event?.end_date ? new Date(event.end_date).toISOString().split('T')[0] : '',
    max_trucks: event?.max_trucks || '',
    registration_fee: event?.registration_fee || '',
    image_url: event?.image_url || '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(formData.image_url)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
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
    const fileName = `${Date.now()}.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('events')
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

      const eventData = {
        ...formData,
        image_url,
        max_trucks: parseInt(formData.max_trucks),
        registration_fee: parseFloat(formData.registration_fee),
      }

      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData])

        if (error) throw error
      }

      Swal.fire({
        icon: 'success',
        title: event ? 'อัปเดตอีเวนต์สำเร็จ' : 'สร้างอีเวนต์สำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      })

      if (onSubmit) {
        onSubmit()
      }
    } catch (error) {
      console.error('Error saving event:', error)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่ออีเวนต์
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

        <div className="md:col-span-2">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานที่จัดงาน
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่มงาน
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่จบงาน
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            จำนวนร้านค้าสูงสุด
          </label>
          <input
            type="number"
            name="max_trucks"
            value={formData.max_trucks}
            onChange={handleChange}
            required
            min="1"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ค่าลงทะเบียน (บาท)
          </label>
          <input
            type="number"
            name="registration_fee"
            value={formData.registration_fee}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input w-full"
          />
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
            event ? 'อัปเดตอีเวนต์' : 'สร้างอีเวนต์'
          )}
        </button>
      </div>
    </form>
  )
}

export default EventForm
