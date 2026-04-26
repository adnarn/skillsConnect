import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Search, Crosshair, User, Star, Navigation, 
  Briefcase, Calendar, DollarSign, X, Loader2,
  ChevronUp, ChevronDown, LocateFixed
} from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dutsin-Ma center coordinates
const DUTSIN_MA_CENTER = [12.9908, 7.6017];
const DEFAULT_ZOOM = 13;

// Skill emojis mapping
const skillEmojis = {
  plumber: '🚿',
  electrician: '⚡',
  carpenter: '🔨',
  painter: '🎨',
  mechanic: '🔧',
  mason: '🧱',
  cleaner: '🧹',
  welder: '🔥'
};

// Custom marker icons
const createWorkerIcon = (isVerified, isSelected, skill) => {
  const emoji = skillEmojis[skill?.toLowerCase()] || '🔧';
  const color = isVerified ? '#22c55e' : '#3b82f6';
  const size = isSelected ? 40 : 36;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '20px' : '18px'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">${emoji}${isVerified ? '<span style="position: absolute; top: -2px; right: -2px; font-size: 10px;">✓</span>' : ''}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Client location marker (blue pulsing)
const clientLocationIcon = L.divIcon({
  className: 'client-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 0 16px rgba(59, 130, 246, 0.1); }
        100% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map controller component for programmatic map control
function MapController({ center, zoom, flyToLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, 13, { duration: 1.5 });
    }
  }, [flyToLocation, map]);

  return null;
}

export default function MapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // State
  const [clientLocation, setClientLocation] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [skillFilter, setSkillFilter] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingData, setBookingData] = useState({
    service: '',
    description: '',
    address: '',
    date: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState(null);

  // Skills list
  const skills = ['', 'plumber', 'electrician', 'carpenter', 'painter', 'mechanic', 'mason', 'cleaner', 'welder'];

  // Fetch visible workers
  const fetchVisibleWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/workers/visible');
      setWorkers(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching visible workers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get client location
  const getClientLocation = () => {
    setLocationError(null);
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setClientLocation([longitude, latitude]);
        setFlyToLocation([latitude, longitude]);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to retrieve your location.';
        if (error.code === 1) {
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === 2) {
          errorMessage = 'Unable to determine your location. Please try again.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  // Auto-refresh workers every 30 seconds
  useEffect(() => {
    fetchVisibleWorkers();
    const interval = setInterval(fetchVisibleWorkers, 30000);
    return () => clearInterval(interval);
  }, [fetchVisibleWorkers]);

  // Initial load - fetch workers immediately without requiring client location
  useEffect(() => {
    fetchVisibleWorkers();
  }, []);

  // Handle worker selection
  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    if (worker.location?.coordinates) {
      setFlyToLocation([worker.location.coordinates[1], worker.location.coordinates[0]]);
    }
  };

  // Open booking modal
  const openBooking = (worker, e) => {
    e.stopPropagation();
    setBookingWorker(worker);
    setBookingData({
      service: worker.skills?.[0] || '',
      description: '',
      address: '',
      date: ''
    });
    setShowBookingModal(true);
  };

  // Submit booking
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        workerId: bookingWorker._id,
        ...bookingData,
        price: bookingWorker.priceRange?.min || 0
      });
      setShowBookingModal(false);
      setBookingWorker(null);
      alert('Booking submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Recenter map
  const recenterMap = () => {
    if (clientLocation) {
      setFlyToLocation([clientLocation[1], clientLocation[0]]);
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full">
      {/* Left Sidebar / Mobile Bottom Sheet / Tablet Collapsible Panel */}
      <div className={`
        absolute z-20 bg-white shadow-lg overflow-hidden
        lg:left-4 lg:top-4 lg:w-96 lg:max-h-[calc(100vh-100px)] lg:rounded-2xl lg:bottom-auto
        md:left-0 md:top-0 md:w-80 md:h-full md:bottom-auto md:transition-transform md:duration-300
        ${mobilePanelOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
        ${mobilePanelOpen ? 'bottom-0 h-[60vh]' : 'bottom-0 h-16'} 
        left-0 right-0 lg:bottom-auto
        transition-all duration-300
      `}>
        {/* Tablet Toggle Tab */}
        <button 
          onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
          className="hidden md:flex lg:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-white shadow-lg p-3 rounded-r-lg hover:bg-gray-50 z-30"
        >
          {mobilePanelOpen ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronUp className="w-5 h-5 text-gray-600" />}
        </button>
        
        {/* Mobile Handle */}
        <button 
          onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
          className="w-full h-8 flex items-center justify-center md:hidden"
        >
          {mobilePanelOpen ? <ChevronDown className="w-6 h-6 text-gray-400" /> : <ChevronUp className="w-6 h-6 text-gray-400" />}
        </button>
        
        {/* Mobile Collapsed State Summary */}
        {!mobilePanelOpen && (
          <div className="px-4 pb-2 md:hidden">
            <p className="text-sm text-gray-600 text-center">
              {workers.length} workers nearby
            </p>
          </div>
        )}
        
        <div className="p-4 h-full overflow-y-auto">
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Find Workers Near You
          </h1>

          {/* Location Error */}
          {locationError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {locationError}
              <button 
                onClick={getClientLocation}
                className="block mt-2 text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-3 mb-4">
            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Skills</option>
                {skills.slice(1).map(skill => (
                  <option key={skill} value={skill}>
                    {skillEmojis[skill]} {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance: {maxDistance}km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5km</span>
                <span>100km</span>
              </div>
            </div>

            {/* Use My Location Button */}
            <button
              onClick={getClientLocation}
              disabled={locationLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4 mr-2" />
                  Use My Location
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">Finding workers...</span>
            </div>
          )}

          {/* Workers List */}
          {!loading && workers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No visible workers found</p>
              <p className="text-sm">Workers may be in ghost mode</p>
            </div>
          )}

          <div className="space-y-2">
            {workers.map((worker) => (
              <button
                key={worker._id}
                onClick={() => handleWorkerClick(worker)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedWorker?._id === worker._id 
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {worker.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{worker.name}</span>
                      {worker.availability && (
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Available" />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mr-2">{skillEmojis[worker.skills?.[0]?.toLowerCase()] || '🔧'}</span>
                      <span className="capitalize truncate">{worker.skills?.[0]}</span>
                      <span className="mx-2 flex-shrink-0">•</span>
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{worker.location?.city || 'Dutsin-Ma'}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{worker.rating?.toFixed(1) || '0.0'}</span>
                      <span className="mx-2 text-gray-300 flex-shrink-0">|</span>
                      <span className="text-sm text-gray-600 truncate">
                        ₦{worker.priceRange?.min?.toLocaleString()} - ₦{worker.priceRange?.max?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="mt-4 text-xs text-gray-400 text-center">
              Last updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={DUTSIN_MA_CENTER}
        zoom={DEFAULT_ZOOM}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          center={clientLocation ? [clientLocation[1], clientLocation[0]] : DUTSIN_MA_CENTER}
          zoom={clientLocation ? 13 : DEFAULT_ZOOM}
          flyToLocation={flyToLocation}
        />

        {/* Client Location Marker */}
        {clientLocation && (
          <>
            <Marker
              position={[clientLocation[1], clientLocation[0]]}
              icon={clientLocationIcon}
            />
            <Circle
              center={[clientLocation[1], clientLocation[0]]}
              radius={maxDistance * 1000}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#3b82f6',
                weight: 1
              }}
            />
          </>
        )}

        {/* Worker Markers */}
        {workers.map((worker) => (
          worker.location?.coordinates && (
            <Marker
              key={worker._id}
              position={[worker.location.coordinates[1], worker.location.coordinates[0]]}
              icon={createWorkerIcon(worker.isVerified, selectedWorker?._id === worker._id, worker.skills?.[0])}
              eventHandlers={{
                click: () => setSelectedWorker(worker)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                      {worker.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                        {worker.rating?.toFixed(1)} ({worker.reviewCount})
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-primary-600 capitalize mb-1">
                    {skillEmojis[worker.skills?.[0]?.toLowerCase()] || '🔧'} {worker.skills?.[0]}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {worker.location?.city || 'Dutsin-Ma'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    ₦{worker.priceRange?.min?.toLocaleString()} - ₦{worker.priceRange?.max?.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/worker/${worker._id}`)}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={(e) => {
                        openBooking(worker, e);
                        e.target.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click();
                      }}
                      className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Mobile Use My Location Button */}
      <button
        onClick={getClientLocation}
        className="md:hidden absolute bottom-20 right-4 z-20 w-12 h-12 bg-primary-600 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
        title="Use My Location"
      >
        <Crosshair className="w-6 h-6 text-white" />
      </button>

      {/* Recenter Button */}
      <button
        onClick={recenterMap}
        className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Recenter to my location"
      >
        <LocateFixed className="w-6 h-6 text-gray-700" />
      </button>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-700">🟢 Live</span>
      </div>

      {/* Booking Modal */}
      {showBookingModal && bookingWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book {bookingWorker.name}</h2>
                <p className="text-sm text-gray-500">
                  {skillEmojis[bookingWorker.skills?.[0]?.toLowerCase()] || '🔧'} {bookingWorker.skills?.[0]}
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Service
                </label>
                <select
                  value={bookingData.service}
                  onChange={(e) => setBookingData({ ...bookingData, service: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  {bookingWorker.skills?.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the job
                </label>
                <textarea
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="3"
                  placeholder="What do you need help with?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Your Address
                </label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter your full address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
