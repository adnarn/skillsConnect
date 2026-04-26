import { Link } from 'react-router-dom';
import { Users, CheckCircle, Wrench, MapPin } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: '20+ Skilled Workers',
      description: 'Access verified professionals in Dutsin-Ma, Katsina'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Verified Reviews',
      description: 'Read genuine reviews from real customers'
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Multiple Skills',
      description: 'Find plumbers, electricians, carpenters and more'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Local Services',
      description: 'Connect with workers in your area'
    }
  ];

  const skills = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 
    'Mechanic', 'Mason', 'Cleaner', 'Welder'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-bold mb-6">
            Find Skilled Workers in Nigeria
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Connect with verified plumbers, electricians, carpenters and more in your local area
          </p>
          
          {/* Live Counters */}
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 md:px-8">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold">20+</div>
              <div className="text-primary-200 text-sm">Skilled Workers</div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-white/20"></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 md:px-8">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold">Dutsin-Ma</div>
              <div className="text-primary-200 text-sm">Katsina State</div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-white/20"></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 md:px-8 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-primary-200 text-sm">Workers online now</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Find a Worker
            </Link>
            <Link
              to="/map"
              className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Open Live Map 🗺️
            </Link>
            <Link
              to="/register"
              className="bg-primary-500 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-primary-400 transition-colors"
            >
              Join as a Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
          Popular Skills
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <Link
              key={skill}
              to={`/explore?skill=${skill.toLowerCase()}`}
              className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
              <span className="text-gray-900 font-medium text-sm md:text-base">{skill}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Why Choose SkillConnect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-4 md:p-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-8">
            Whether you are looking for skilled workers or want to offer your services, 
            SkillConnect is the platform for you.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/explore"
              className="bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              Browse Workers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
