import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Briefcase } from 'lucide-react';

export default function WorkerCard({ worker }) {
  // Calculate estimated earnings
  const avgPrice = (worker.priceRange.min + worker.priceRange.max) / 2;
  const estimatedEarnings = worker.completedJobs * avgPrice;

  const isVerified = worker.isVerified;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0">
              {worker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{worker.name}</h3>
              <div className="flex items-center text-gray-500 text-xs md:text-sm">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{worker.location?.address || worker.location?.city || 'Nigeria'}</span>
              </div>
            </div>
          </div>
          {isVerified && (
            <span className="flex items-center text-green-600 text-xs md:text-sm font-medium bg-green-50 px-2 py-1 rounded-full flex-shrink-0">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Verified</span>
              <span className="sm:hidden">✓</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {worker.skills.map((skill, idx) => (
            <span
              key={idx}
              className="bg-primary-50 text-primary-700 text-xs px-2 md:px-3 py-1 rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2">{worker.bio}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-gray-700 font-medium text-sm md:text-base">{worker.rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-400 text-xs md:text-sm">({worker.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs md:text-sm">
            <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            {worker.completedJobs} jobs
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="text-gray-900 font-semibold text-sm md:text-base">
            ₦{worker.priceRange.min.toLocaleString()} - ₦{worker.priceRange.max.toLocaleString()}
          </div>
          <Link
            to={`/worker/${worker._id || worker.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
