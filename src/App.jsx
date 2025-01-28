import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Suspense, lazy } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Loading from './components/Loading'

// Lazy load components
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const TruckProfile = lazy(() => import('./pages/TruckProfile'))
const EventProfile = lazy(() => import('./pages/EventProfile'))
const Events = lazy(() => import('./pages/Events'))
const CreateEvent = lazy(() => import('./pages/CreateEvent'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const TruckDetail = lazy(() => import('./pages/TruckDetail'))

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/truck/:id" element={<TruckProfile />} />
                <Route path="/event/:id" element={<EventProfile />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/create" element={<CreateEvent />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/trucks/:id" element={<TruckDetail />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
