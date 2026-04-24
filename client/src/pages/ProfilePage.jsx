import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  User, Mail, Phone, MapPin, Calendar, Lock, Shield, 
  Clock, CheckCircle, XCircle, Star, Briefcase, 
  Loader2, LogOut, Map as MapIcon, ChevronRight, Edit3, 
  ToggleLeft, ToggleRight, Save, Copy
} from 'lucide-react';

const AVATAR_COLORS = [
  '#1D9E75', '#3B82F6', '#EF4444', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#10B981', '#6366F1'
];

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const dropdownRef = useRef(null);

  // Personal Info form state
  const [personalForm, setPersonalForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Worker profile form state
  const [workerForm, setWorkerForm] = useState({
    skills: '',
    bio: '',
    experience: '',
    priceMin: '',
    priceMax: ''
  });

  // Activity state
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Avatar color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({ bookingId: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(null);

  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        state: user.location?.state || ''
      });
      setWorkerForm({
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
        experience: user.experience || '',
        priceMin: user.priceRange?.min || '',
        priceMax: user.priceRange?.max || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await api.get('/bookings/my');
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/auth/update-profile', {
        name: personalForm.name,
        phone: personalForm.phone,
        location: {
          address: personalForm.address,
          city: personalForm.city,
          state: personalForm.state
        }
      });
      await fetchMe();
      showToast('Profile updated successfully!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Password change failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/workers/profile', {
        skills: workerForm.skills.split(',').map(s => s.trim()),
        bio: workerForm.bio,
        experience: parseInt(workerForm.experience),
        priceRange: {
          min: parseInt(workerForm.priceMin),
          max: parseInt(workerForm.priceMax)
        }
      });
      await fetchMe();
      showToast('Worker profile updated!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarColorChange = async (color) => {
    try {
      await api.patch('/auth/update-profile', { avatarColor: color });
      await fetchMe();
      setShowColorPicker(false);
      showToast('Avatar color updated!');
    } catch (error) {
      showToast('Failed to update avatar color', 'error');
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      await api.patch('/workers/availability', { availability: !user.availability });
      await fetchMe();
      showToast(`You are now ${!user.availability ? 'available' : 'offline'}`);
    } catch (error) {
      showToast('Failed to update availability', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        bookingId: reviewForm.bookingId,
        workerId: activities.find(a => a._id === reviewForm.bookingId)?.worker?._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setShowReviewForm(null);
      setReviewForm({ bookingId: '', rating: 5, comment: '' });
      await fetchActivities();
      showToast('Review submitted!');
    } catch (error) {
      showToast('Failed to submit review', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress': return <Briefcase className="w-5 h-5 text-purple-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'activity', label: 'My Activity', icon: Clock },
    ...(user?.role === 'worker' ? [{ id: 'worker', label: 'Worker Profile', icon: Briefcase }] : [])
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
                  style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  user.role === 'worker' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'worker' ? 'Worker' : 'Client'}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{user.location?.city || 'Nigeria'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{user.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {user.role === 'worker' && (
                <>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Availability</span>
                      <button
                        onClick={handleAvailabilityToggle}
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.availability ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                        {user.availability ? 'Available' : 'Offline'}
                      </button>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{user.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400 ml-1">({user.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600 mt-2">
                      <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{user.completedJobs || 0} jobs completed</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Tab Navigation */}
              <div className="border-b border-gray-100">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <form onSubmit={handlePersonalSubmit} className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Change Avatar
                        </button>
                        {showColorPicker && (
                          <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="grid grid-cols-4 gap-2">
                              {AVATAR_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => handleAvatarColorChange(color)}
                                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={personalForm.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={personalForm.address}
                        onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={personalForm.city}
                          onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={personalForm.state}
                          onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                      Save Changes
                    </button>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                      Change Password
                    </button>
                  </form>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">My Activity</h3>
                    {loadingActivities ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No activity yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {getStatusIcon(activity.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{activity.service}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    activity.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    activity.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                                    activity.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {activity.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                                  {user.role === 'client' && activity.worker && (
                                    <span>Worker: {activity.worker.name}</span>
                                  )}
                                  {user.role === 'worker' && activity.client && (
                                    <span>Client: {activity.client?.name || 'N/A'}</span>
                                  )}
                                </div>
                                {user.role === 'client' && activity.status === 'completed' && !activity.reviewed && (
                                  <button
                                    onClick={() => {
                                      setShowReviewForm(activity._id);
                                      setReviewForm({ ...reviewForm, bookingId: activity._id });
                                    }}
                                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                  >
                                    Leave Review
                                  </button>
                                )}
                                {showReviewForm === activity._id && (
                                  <form onSubmit={handleReviewSubmit} className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                          className="text-2xl"
                                        >
                                          {star <= reviewForm.rating ? '⭐' : '☆'}
                                        </button>
                                      ))}
                                    </div>
                                    <textarea
                                      value={reviewForm.comment}
                                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                      placeholder="Write your review..."
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                      rows="2"
                                      required
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        type="submit"
                                        className="px-4 py-1 bg-primary-600 text-white rounded text-sm"
                                      >
                                        Submit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setShowReviewForm(null)}
                                        className="px-4 py-1 border border-gray-200 rounded text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Worker Profile Tab */}
                {activeTab === 'worker' && user.role === 'worker' && (
                  <form onSubmit={handleWorkerProfileSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Worker Profile</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={workerForm.skills}
                        onChange={(e) => setWorkerForm({ ...workerForm, skills: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="plumber, electrician..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={workerForm.bio}
                        onChange={(e) => setWorkerForm({ ...workerForm, bio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        rows="4"
                        maxLength={500}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{workerForm.bio.length}/500 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        value={workerForm.experience}
                        onChange={(e) => setWorkerForm({ ...workerForm, experience: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₦)</label>
                        <input
                          type="number"
                          value={workerForm.priceMin}
                          onChange={(e) => setWorkerForm({ ...workerForm, priceMin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₦)</label>
                        <input
                          type="number"
                          value={workerForm.priceMax}
                          onChange={(e) => setWorkerForm({ ...workerForm, priceMax: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                      Save Changes
                    </button>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">How clients see your profile</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                            style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{user.name}</h5>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              {user.location?.city || 'Nigeria'}
                            </div>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="ml-1 text-sm">{user.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {workerForm.skills.split(',').map((skill, idx) => (
                            skill.trim() && (
                              <span key={idx} className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full">
                                {skill.trim()}
                              </span>
                            )
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{workerForm.bio}</p>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
