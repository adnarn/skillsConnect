import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { CheckCircle, Clock, XCircle, Upload, Loader2, AlertCircle } from 'lucide-react';

export default function KYCPage() {
  const { user, fetchMe } = useAuth();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    fullName: '',
    idType: 'NIN',
    idNumber: '',
    address: '',
    phone: ''
  });

  const [idPhotoPreview, setIdPhotoPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [idPhotoFile, setIdPhotoFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const res = await api.get('/kyc/my-status');
      setKycStatus(res.data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'idPhoto') {
        setIdPhotoFile(file);
        setIdPhotoPreview(URL.createObjectURL(file));
      } else {
        setSelfieFile(file);
        setSelfiePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idPhotoFile || !selfieFile) {
      showToast('Please upload both ID photo and selfie', 'error');
      return;
    }

    setSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('idType', formData.idType);
    formDataToSend.append('idNumber', formData.idNumber);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('idPhoto', idPhotoFile);
    formDataToSend.append('selfie', selfieFile);

    try {
      await api.post('/kyc/submit', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchKYCStatus();
      await fetchMe();
      showToast('KYC submitted successfully!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => {
    setKycStatus(null);
    setFormData({
      fullName: '',
      idType: 'NIN',
      idNumber: '',
      address: '',
      phone: ''
    });
    setIdPhotoPreview(null);
    setSelfiePreview(null);
    setIdPhotoFile(null);
    setSelfieFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (user?.role !== 'worker') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">KYC verification is only for workers</p>
        </div>
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

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Not submitted */}
        {!kycStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Get Verified ✓</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Verified workers get 3x more bookings. Submit your ID to get the green verified badge on your profile.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6 md:mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Benefits of verification:</h3>
              <ul className="space-y-2 text-xs md:text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Verified badge on your profile
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Appear higher in search results
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Clients trust you more
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Access to premium bookings
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  <option value="NIN">National Identity Number (NIN)</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                  <option value="passport">International Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID Photo</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    {idPhotoPreview ? (
                      <img src={idPhotoPreview} alt="ID Preview" className="w-full h-32 md:h-48 object-cover rounded" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload ID photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'idPhoto')}
                      className="w-full mt-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Selfie</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie Preview" className="w-full h-32 md:h-48 object-cover rounded" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload selfie</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'selfie')}
                      className="w-full mt-2"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Submit KYC'}
              </button>
            </form>
          </div>
        )}

        {/* Pending */}
        {kycStatus?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-8">
            <div className="text-center">
              <Clock className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Verification Under Review</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Your documents have been submitted and are being reviewed by our team. This usually takes 24-48 hours.
              </p>
              <div className="bg-white rounded-lg p-4 text-left">
                <p className="text-xs md:text-sm text-gray-500">Submitted: {new Date(kycStatus.createdAt).toLocaleDateString()}</p>
                <p className="text-xs md:text-sm text-gray-500">ID Type: {kycStatus.idType}</p>
                <p className="text-xs md:text-sm text-gray-500">Name: {kycStatus.fullName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Approved */}
        {kycStatus?.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Identity Verified</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Your account is verified. You now appear with a verified badge to all clients.
              </p>
              <div className="bg-white rounded-lg p-4 text-left">
                <p className="text-xs md:text-sm text-gray-500">Verified: {new Date(kycStatus.reviewedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected */}
        {kycStatus?.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-8">
            <div className="text-center">
              <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Verification Rejected</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">{kycStatus.rejectionReason || 'Your documents could not be verified.'}</p>
              <button
                onClick={handleResubmit}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700"
              >
                Resubmit Documents
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
