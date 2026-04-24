import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Briefcase } from 'lucide-react';

export default function WorkerCard({ worker }) {
  // Calculate estimated earnings
  const avgPrice = (worker.priceRange.min + worker.priceRange.max) / 2;
  const estimatedEarnings = worker.completedJobs * avgPrice;

  const isVerified = worker.isVerified;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {worker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {worker.location?.address || worker.location?.city || 'Nigeria'}
              </div>
            </div>
          </div>
          {isVerified && (
            <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="w-4 h-4 mr-1" />
              Verified
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {worker.skills.map((skill, idx) => (
            <span
              key={idx}
              className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{worker.bio}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-gray-700 font-medium">{worker.rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-400 text-sm">({worker.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Briefcase className="w-4 h-4 mr-1" />
            {worker.completedJobs} jobs
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-gray-900 font-semibold">
            ₦{worker.priceRange.min.toLocaleString()} - ₦{worker.priceRange.max.toLocaleString()}
          </div>
          <Link
            to={`/worker/${worker._id || worker.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
