import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import useLocationBroadcast from '../hooks/useLocationBroadcast';
import { 
  Calendar, MapPin, DollarSign, Clock, CheckCircle, 
  Loader2, User, Briefcase, XCircle, PlayCircle, 
  ToggleLeft, ToggleRight, Wallet, Radio
} from 'lucide-react';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-700',
  'accepted': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  'completed': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700'
};

const statusLabels = {
  'pending': 'Pending',
  'accepted': 'Accepted',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

export default function WorkerDashboard() {
  const { user, setUser } = useAuth();
  const { isBroadcasting } = useLocationBroadcast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    earnings: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/worker');
      setBookings(res.data);
      
      const completed = res.data.filter(b => b.status === 'completed');
      const earnings = completed.reduce((sum, b) => sum + (b.price || 0), 0);
      
      setStats({
        total: res.data.length,
        pending: res.data.filter(b => b.status === 'pending').length,
        completed: completed.length,
        earnings
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await api.put('/workers/availability', { 
        availability: !user.availability 
      });
      setUser({ ...user, availability: res.data.availability });
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  // Calculate estimated earnings
  const avgPrice = user?.priceRange ? (user.priceRange.min + user.priceRange.max) / 2 : 0;
  const estimatedEarnings = (user?.completedJobs || 0) * avgPrice;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Welcome back, {user?.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            {/* Get Verified Link */}
            {!user?.isVerified && (
              <Link
                to="/kyc"
                className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Verified
              </Link>
            )}
            {/* Location Status */}
            <div className="flex items-center gap-2 text-sm">
              {isBroadcasting ? (
                <>
                  <Radio className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Broadcasting location</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Location off</span>
                </>
              )}
            </div>
            {/* Availability Toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${user?.availability ? 'text-green-600' : 'text-red-600'}`}>
                {user?.availability ? 'Available' : 'Unavailable'}
              </span>
              <button
                onClick={toggleAvailability}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user?.availability ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user?.availability ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Total Bookings</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Pending Requests</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Completed Jobs</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{user?.completedJobs || 0}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Est. Earnings</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">₦{estimatedEarnings.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Booking Requests</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">When clients book your services, they will appear here</p>
              <Link
                to="/explore"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
              >
                View Public Profile
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{booking.description}</p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {booking.client?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{booking.address}</span>
                        </span>
                        {booking.price && (
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ₦{booking.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(booking._id, 'accepted')}
                            className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'in-progress')}
                          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start Job
                        </button>
                      )}
                      {booking.status === 'in-progress' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'completed')}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
