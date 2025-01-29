import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import Swal from 'sweetalert2'

const Navigation = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      })
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถออกจากระบบได้',
      })
    }
  }

  return (
    <nav className="bg-white shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            FoodTruck
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary">
              หน้าแรก
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-primary">
              อีเวนต์
            </Link>
            <Link to="/trucks" className="text-gray-600 hover:text-primary">
              ร้านค้า
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-primary">
                  <FiUser />
                  โปรไฟล์
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary"
                >
                  <FiLogOut />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-primary">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn-secondary">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-primary"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              หน้าแรก
            </Link>
            <Link
              to="/events"
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              อีเวนต์
            </Link>
            <Link
              to="/trucks"
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              ร้านค้า
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser />
                  โปรไฟล์
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary"
                >
                  <FiLogOut />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="block btn-secondary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
