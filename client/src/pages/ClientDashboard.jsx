import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { 
  Calendar, MapPin, DollarSign, Clock, CheckCircle, 
  Loader2, User, Briefcase, XCircle, MessageCircle 
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

export default function ClientDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChatId, setOpenChatId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/client');
      setBookings(res.data);
      
      setStats({
        total: res.data.length,
        pending: res.data.filter(b => b.status === 'pending' || b.status === 'accepted').length,
        completed: res.data.filter(b => b.status === 'completed').length
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

  const toggleChat = (bookingId) => {
    setOpenChatId(openChatId === bookingId ? null : bookingId);
  };

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
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Welcome back, {user?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
                <p className="text-gray-500 text-xs md:text-sm">Active Bookings</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Completed Jobs</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">My Bookings</h2>
              <Link
                to="/explore"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
              >
                Find a Worker
              </Link>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">Find skilled workers and book their services</p>
              <Link
                to="/explore"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
              >
                Explore Workers
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                  {/* Worker Accepted Status Card */}
                  {(booking.status === 'accepted' || booking.status === 'in-progress') && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">✓</span>
                        <h3 className="font-bold text-gray-900">Worker Accepted Your Request</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{booking.worker?.name} is on the way</p>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                        <span>🔧 {booking.service}</span>
                        <span>·</span>
                        <span>⭐ {booking.worker?.rating?.toFixed(1) || 'N/A'}</span>
                        <span>·</span>
                        {booking.worker?.isVerified && (
                          <span className="text-green-600 font-medium">✓ Verified</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => toggleChat(booking._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Open Chat
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                        {(booking.status === 'accepted' || booking.status === 'in-progress' || booking.status === 'completed') && (
                          <button
                            onClick={() => toggleChat(booking._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{booking.description}</p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {booking.worker?.name}
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
                      {booking.status === 'in-progress' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'completed')}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'cancelled')}
                          className="flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  {openChatId === booking._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ChatBox
                        bookingId={booking._id}
                        otherUserName={booking.worker?.name || 'Worker'}
                        onClose={() => setOpenChatId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
