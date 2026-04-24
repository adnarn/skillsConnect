import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Briefcase, Calendar, DollarSign, CheckCircle, Loader2, MessageSquare, Copy, ChevronRight } from 'lucide-react';

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    service: '',
    description: '',
    date: '',
    address: '',
    price: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const fetchWorker = async () => {
    try {
      const res = await api.get(`/workers/${id}`);
      setWorker(res.data);
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'client') {
      setBookingError('Only clients can book workers');
      setBookingLoading(false);
      return;
    }

    try {
      await api.post('/bookings', {
        workerId: id,
        ...bookingData,
        price: parseInt(bookingData.price)
      });
      setShowBookingModal(false);
      navigate('/client-dashboard');
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({ show: true, message: 'Profile link copied!' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Worker not found</h1>
      </div>
    );
  }

  const isVerified = worker.isVerified;
  const avgPrice = (worker.priceRange.min + worker.priceRange.max) / 2;
  const estimatedEarnings = worker.completedJobs * avgPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <div className="fixed top-4 right-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link to="/explore" className="hover:text-gray-900">Find Workers</Link>
            <ChevronRight className="w-4 h-2 mx-2" />
            <span className="text-gray-900">{worker.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
              {worker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{worker.name}</h1>
                {isVerified && (
                  <span className="flex items-center justify-center md:justify-start text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-gray-600 text-sm md:text-base">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {worker.location?.address || worker.location?.city || 'Nigeria'}
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                  {worker.rating.toFixed(1)} ({worker.reviewCount} reviews)
                </span>
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {worker.completedJobs} jobs completed
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleShareProfile}
                className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Share Profile
              </button>
              {user?.role === 'client' && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors w-full sm:w-auto"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-50 text-primary-700 px-3 md:px-4 py-2 rounded-full font-medium text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">{worker.bio}</p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Years of Experience</span>
                  <span className="font-semibold text-gray-900">{worker.experience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Completed Jobs</span>
                  <span className="font-semibold text-gray-900">{worker.completedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Rating</span>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold text-gray-900">{worker.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Stats */}
          <div className="space-y-6 md:sticky md:top-20 md:self-start">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-2">
                ₦{worker.priceRange.min.toLocaleString()} - ₦{worker.priceRange.max.toLocaleString()}
              </div>
              <p className="text-gray-500 text-sm">per job</p>
              {user?.role === 'worker' && user?.id === (worker._id || worker.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">Est. Earnings</div>
                  <div className="text-lg md:text-xl font-semibold text-green-600">
                    ₦{estimatedEarnings.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
              <div className={`flex items-center ${worker.availability ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${worker.availability ? 'bg-green-500' : 'bg-red-500'}`} />
                {worker.availability ? 'Available for work' : 'Currently unavailable'}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm md:text-base">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  {worker.location?.address || worker.location?.city || 'Nigeria'}
                </div>
                {user && (
                  <div className="flex items-center text-gray-600 text-sm md:text-base">
                    <MessageSquare className="w-5 h-5 mr-3 text-gray-400" />
                    <button className="text-primary-600 hover:text-primary-700">
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Book {worker.name}</h2>
            </div>
            <form onSubmit={handleBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {bookingError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Required
                </label>
                <select
                  value={bookingData.service}
                  onChange={(e) => setBookingData({ ...bookingData, service: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  <option value="">Select a service</option>
                  {worker.skills.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="3"
                  placeholder="Describe what you need..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter your address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Proposed Price (₦)
                </label>
                <input
                  type="number"
                  value={bookingData.price}
                  onChange={(e) => setBookingData({ ...bookingData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {bookingLoading ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
