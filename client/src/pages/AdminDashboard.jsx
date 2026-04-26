import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  LayoutDashboard, Users, Shield, Calendar, LogOut, 
  Menu, X, Loader2, CheckCircle, XCircle, Search, Filter,
  Ban, Check, AlertTriangle, Clock, Briefcase, UserPlus, UserMinus
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [kycs, setKycs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [rejectionModal, setRejectionModal] = useState({ show: false, kycId: '', reason: '' });

  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('pending');
  const [bookingFilter, setBookingFilter] = useState('all');

  useEffect(() => {
    if (activePage === 'overview') fetchStats();
    if (activePage === 'users') fetchUsers();
    if (activePage === 'kyc') fetchKYCs();
    if (activePage === 'bookings') fetchBookings();
  }, [activePage, userFilter, kycFilter, bookingFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { 
        params: { role: userFilter === 'all' ? undefined : userFilter, search: userSearch || undefined }
      });
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/all', { params: { status: kycFilter } });
      setKycs(res.data);
    } catch (error) {
      console.error('Error fetching KYCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', { params: { status: bookingFilter === 'all' ? undefined : bookingFilter } });
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      await fetchUsers();
      showToast('User status updated');
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleKYCReview = async (kycId, status, reason = '') => {
    try {
      await api.patch(`/kyc/${kycId}/review`, { status, rejectionReason: reason });
      await fetchKYCs();
      await fetchStats();
      showToast(`KYC ${status}`);
      setRejectionModal({ show: false, kycId: '', reason: '' });
    } catch (error) {
      showToast('Failed to review KYC', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'kyc', label: 'KYC Verification', icon: Shield, badge: stats?.pendingKYC || 0 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ];

  const StatCard = ({ title, value, icon: Icon, color, highlight }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${highlight ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {toast.show && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800">
          <h1 className="text-lg md:text-xl font-bold text-white">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                <span className="text-sm md:text-base">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm md:text-base">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen w-full">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div className="w-6" />
        </div>

        <div className="p-4 md:p-6 w-full max-w-full">
          {/* Overview Page */}
          {activePage === 'overview' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Dashboard Overview</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500" />
                    <StatCard title="Total Workers" value={stats?.totalWorkers || 0} icon={Briefcase} color="bg-purple-500" />
                    <StatCard title="Total Clients" value={stats?.totalClients || 0} icon={UserPlus} color="bg-green-500" />
                    <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={Calendar} color="bg-orange-500" />
                    <StatCard title="Completed Bookings" value={stats?.completedBookings || 0} icon={CheckCircle} color="bg-green-600" />
                    <StatCard title="Pending KYC" value={stats?.pendingKYC || 0} icon={Shield} color="bg-yellow-500" highlight={stats?.pendingKYC > 0} />
                    <StatCard title="Verified Workers" value={stats?.verifiedWorkers || 0} icon={Check} color="bg-teal-500" />
                    <StatCard title="Pending Bookings" value={stats?.pendingBookings || 0} icon={Clock} color="bg-indigo-500" />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                    {/* Mobile card view */}
                    <div className="md:hidden space-y-3">
                      {stats?.recentBookings?.map((booking) => (
                        <div key={booking._id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{booking.client?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">Client</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p><span className="font-medium">Worker:</span> {booking.worker?.name || 'N/A'}</p>
                            <p><span className="font-medium">Service:</span> {booking.service || 'N/A'}</p>
                            <p><span className="font-medium">Date:</span> {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Worker</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Skill</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentBookings?.map((booking) => (
                            <tr key={booking._id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm">{booking.client?.name || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm">{booking.worker?.name || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm">{booking.service || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Users Page */}
          {activePage === 'users' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Users Management</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'worker', 'client'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setUserFilter(filter)}
                        className={`px-3 md:px-4 py-2 rounded-lg font-medium capitalize text-sm ${
                          userFilter === filter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <>
                    {/* Mobile card view */}
                    <div className="md:hidden space-y-3">
                      {users.map((user) => (
                        <div key={user._id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <button
                              onClick={() => handleToggleUser(user._id)}
                              className={`p-2 rounded-lg ${
                                user.isActive 
                                  ? 'bg-red-50 text-red-600' 
                                  : 'bg-green-50 text-green-600'
                              }`}
                            >
                              {user.isActive ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p><span className="font-medium">Role:</span> 
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ml-1 ${
                                user.role === 'worker' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </p>
                            <p><span className="font-medium">City:</span> {user.location?.city || 'N/A'}</p>
                            <p><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                            {!user.isActive && (
                              <p className="text-red-600 font-medium">Suspended</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">
                      <div className="px-4 md:px-0">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Name</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Email</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Role</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">City</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Joined</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Status</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user._id} className="border-b border-gray-100">
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium">{user.name}</td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-500">{user.email}</td>
                                <td className="py-3 px-2 md:px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                    user.role === 'worker' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-500">{user.location?.city || 'N/A'}</td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-2 md:px-4">
                                  {!user.isActive && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 md:px-4">
                                  <button
                                    onClick={() => handleToggleUser(user._id)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                      user.isActive 
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                                  >
                                    {user.isActive ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* KYC Verification Page */}
          {activePage === 'kyc' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">KYC Verification</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-wrap">
                  {['pending', 'approved', 'rejected'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setKycFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize text-sm whitespace-nowrap ${
                        kycFilter === filter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                ) : kycs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No KYC submissions found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:gap-6">
                    {kycs.map((kyc) => (
                      <div key={kyc._id} className="border border-gray-200 rounded-lg p-4 md:p-6">
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">{kyc.worker?.name || 'Unknown'}</h3>
                            <div className="space-y-1 text-xs md:text-sm text-gray-600">
                              <p><span className="font-medium">Skills:</span> {kyc.worker?.skills?.join(', ') || 'N/A'}</p>
                              <p><span className="font-medium">City:</span> {kyc.worker?.location?.city || 'N/A'}</p>
                              <p><span className="font-medium">ID Type:</span> {kyc.idType}</p>
                              <p><span className="font-medium">ID Number:</span> {kyc.idNumber}</p>
                              <p className="text-gray-500"><span className="font-medium">Submitted:</span> {new Date(kyc.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
                            {kyc.idPhotoUrl && (
                              <div className="flex-shrink-0">
                                <p className="text-xs text-gray-500 mb-1">ID Photo</p>
                                <img
                                  src={kyc.idPhotoUrl}
                                  alt="ID"
                                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                  onLoad={() => console.log('Image loaded:', kyc.idPhotoUrl)}
                                  onError={(e) => {
                                    console.error('Image load error:', e.target.src);
                                    console.error('KYC data:', kyc);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            {kyc.selfieUrl && (
                              <div className="flex-shrink-0">
                                <p className="text-xs text-gray-500 mb-1">Selfie</p>
                                <img
                                  src={kyc.selfieUrl}
                                  alt="Selfie"
                                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                  onLoad={() => console.log('Image loaded:', kyc.selfieUrl)}
                                  onError={(e) => {
                                    console.error('Image load error:', e.target.src);
                                    console.error('KYC data:', kyc);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {kyc.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleKYCReview(kyc._id, 'approved')}
                              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectionModal({ show: true, kycId: kyc._id, reason: '' })}
                              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        )}
                        {kyc.status === 'approved' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-green-600 font-medium text-sm md:text-base">✓ Approved on {new Date(kyc.reviewedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {kyc.status === 'rejected' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-red-600 font-medium text-sm md:text-base">✗ Rejected: {kyc.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Page */}
          {activePage === 'bookings' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Bookings Management</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {['all', 'pending', 'completed', 'cancelled'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBookingFilter(filter)}
                      className={`px-3 md:px-4 py-2 rounded-lg font-medium capitalize text-sm ${
                        bookingFilter === filter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <>
                    {/* Mobile card view */}
                    <div className="md:hidden space-y-3">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{booking.client?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">Client</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              booking.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                              booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p><span className="font-medium">Worker:</span> {booking.worker?.name || 'N/A'}</p>
                            <p><span className="font-medium">Service:</span> {booking.service || 'N/A'}</p>
                            <p><span className="font-medium">Description:</span> {booking.description || 'N/A'}</p>
                            <p><span className="font-medium">Date:</span> {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">
                      <div className="px-4 md:px-0">
                        <table className="w-full min-w-[800px]">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Client</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Worker</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Skill</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Description</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Status</th>
                              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-600">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map((booking) => (
                              <tr key={booking._id} className="border-b border-gray-100">
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm">{booking.client?.name || 'N/A'}</td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm">{booking.worker?.name || 'N/A'}</td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm">{booking.service || 'N/A'}</td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-500 max-w-xs truncate">{booking.description || 'N/A'}</td>
                                <td className="py-3 px-2 md:px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    booking.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                                    booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject KYC</h3>
            <textarea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              rows="4"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleKYCReview(rejectionModal.kycId, 'rejected', rejectionModal.reason)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => setRejectionModal({ show: false, kycId: '', reason: '' })}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
