import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-white shadow-soft mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">เกี่ยวกับเรา</h3>
            <p className="text-gray-600">
              แพลตฟอร์มที่เชื่อมต่อร้าน Food Truck กับผู้จัดงานและลูกค้า 
              ให้ทุกคนได้สัมผัสประสบการณ์อาหารที่หลากหลาย
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-primary">
                  อีเวนต์
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-primary">
                  สมัครสมาชิก
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2 text-gray-600">
              <li>อีเมล: contact@foodtruck.com</li>
              <li>โทร: 02-123-4567</li>
              <li>เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดตามเรา</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiInstagram size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} FoodTruck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
