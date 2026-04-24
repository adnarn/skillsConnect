import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import api from '../api';
import WorkerCard from '../components/WorkerCard';
import { Search, Map as MapIcon, List, Loader2, ArrowRight } from 'lucide-react';

// Default coordinates for Nigeria center
const NIGERIA_CENTER = [9.0820, 8.6753];
const DEFAULT_ZOOM = 6;

// Custom marker icon
const workerIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function Explore() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    location: '',
    verifiedOnly: false
  });

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.location) params.append('location', filters.location);
      if (filters.verifiedOnly) params.append('verified', 'true');
      
      const res = await api.get(`/workers?${params.toString()}`);
      setWorkers(res.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'skill') {
      setSearchParams(value ? { skill: value } : {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Workers</h1>
              <p className="text-gray-600 text-sm">Find skilled professionals in your area</p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill (plumber, electrician...)"
                value={filters.skill}
                onChange={(e) => handleFilterChange('skill', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="relative flex-1">
              <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <Link
              to="/map"
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
            >
              Switch to Map View
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((worker) => (
                  <WorkerCard key={worker._id || worker.id} worker={worker} />
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                  center={NIGERIA_CENTER}
                  zoom={DEFAULT_ZOOM}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {workers
                    .filter(w => {
                      const coords = w.legacyCoordinates || w.coordinates;
                      return coords && coords.lat && coords.lng;
                    })
                    .map((worker) => {
                      const coords = worker.legacyCoordinates || worker.coordinates;
                      return (
                        <Marker
                          key={worker._id || worker.id}
                          position={[coords.lat, coords.lng]}
                          icon={workerIcon}
                        >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                            <p className="text-sm text-primary-600 capitalize">
                              {worker.skills?.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{worker.location?.address || worker.location?.city || 'Nigeria'}</p>
                            <p className="text-sm font-medium text-gray-900 mt-2">
                              ₦{worker.priceRange?.min?.toLocaleString()} - ₦{worker.priceRange?.max?.toLocaleString()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                      );
                    })}
                </MapContainer>
              </div>
            )}

            {workers.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
