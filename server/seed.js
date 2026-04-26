import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Booking from './models/Booking.js';
import KYC from './models/KYC.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// User's location base coordinates (GeoJSON format: [longitude, latitude])
// 12°57'19.8"N+7°37'38.7"E
const baseCoordinates = [7.62745, 12.9555];

// Add random offset to prevent perfect overlap (±0.005 to ±0.05 degrees)
function addRandomOffset() {
  const offset = 0.005 + Math.random() * 0.045;
  return [
    baseCoordinates[0] + (Math.random() - 0.5) * offset * 2,
    baseCoordinates[1] + (Math.random() - 0.5) * offset * 2
  ];
}

const avatarColors = ['#1D9E75', '#0F6E56', '#065A82', '#6D2E46', '#B85042'];

const workers = [
  {
    name: 'Abdullahi Musa',
    email: 'abdullahi@skillconnect.com',
    skills: ['plumber'],
    experience: 6,
    priceRange: { min: 3000, max: 15000 },
    bio: 'Expert in pipe fitting, borehole repairs, and bathroom installations. 6 years serving Dutsin-Ma.',
    rating: 4.7,
    reviewCount: 32,
    completedJobs: 45,
    isVerified: true
  },
  {
    name: 'Ibrahim Suleiman',
    email: 'ibrahim@skillconnect.com',
    skills: ['electrician'],
    experience: 8,
    priceRange: { min: 2500, max: 12000 },
    bio: 'Licensed electrician. Solar installation, wiring, and generator repairs. Available 24/7.',
    rating: 4.8,
    reviewCount: 40,
    completedJobs: 62,
    isVerified: true
  },
  {
    name: 'Usman Garba',
    email: 'usman@skillconnect.com',
    skills: ['carpenter'],
    experience: 10,
    priceRange: { min: 5000, max: 25000 },
    bio: 'Custom furniture, doors, windows and roofing. Quality guaranteed.',
    rating: 4.9,
    reviewCount: 45,
    completedJobs: 78,
    isVerified: true
  },
  {
    name: 'Aliyu Yusuf',
    email: 'aliyu@skillconnect.com',
    skills: ['painter'],
    experience: 5,
    priceRange: { min: 2000, max: 8000 },
    bio: 'Interior and exterior painting. Affordable rates, clean finishes.',
    rating: 4.5,
    reviewCount: 22,
    completedJobs: 35,
    isVerified: true
  },
  {
    name: 'Musa Abdulkadir',
    email: 'musa@skillconnect.com',
    skills: ['mechanic'],
    experience: 10,
    priceRange: { min: 4000, max: 20000 },
    bio: 'Auto repairs, engine overhaul, and diagnostics. 10 years experience.',
    rating: 4.6,
    reviewCount: 38,
    completedJobs: 65,
    isVerified: true
  },
  {
    name: 'Yahaya Inuwa',
    email: 'yahaya@skillconnect.com',
    skills: ['mason'],
    experience: 7,
    priceRange: { min: 3500, max: 18000 },
    bio: 'Block laying, plastering, tiling, and concrete work.',
    rating: 4.4,
    reviewCount: 28,
    completedJobs: 48,
    isVerified: true
  },
  {
    name: 'Abubakar Danjuma',
    email: 'abubakar@skillconnect.com',
    skills: ['electrician'],
    experience: 6,
    priceRange: { min: 2500, max: 12000 },
    bio: 'Electrical installations for homes and shops. Fast and reliable.',
    rating: 4.3,
    reviewCount: 25,
    completedJobs: 40,
    isVerified: true
  },
  {
    name: 'Ismail Lawal',
    email: 'ismail@skillconnect.com',
    skills: ['plumber'],
    experience: 5,
    priceRange: { min: 3000, max: 15000 },
    bio: 'Water supply, sewage systems, and tank installations.',
    rating: 4.2,
    reviewCount: 18,
    completedJobs: 30,
    isVerified: true
  },
  {
    name: 'Mustapha Sani',
    email: 'mustapha@skillconnect.com',
    skills: ['welder'],
    experience: 8,
    priceRange: { min: 4500, max: 22000 },
    bio: 'Metal fabrication, gates, burglar proofs, and railings.',
    rating: 4.7,
    reviewCount: 35,
    completedJobs: 55,
    isVerified: true
  },
  {
    name: 'Haruna Bello',
    email: 'haruna@skillconnect.com',
    skills: ['carpenter'],
    experience: 9,
    priceRange: { min: 5000, max: 25000 },
    bio: 'Roofing, ceilings, and interior woodwork specialist.',
    rating: 4.8,
    reviewCount: 42,
    completedJobs: 70,
    isVerified: true
  },
  {
    name: 'Aminu Zakari',
    email: 'aminu@skillconnect.com',
    skills: ['painter'],
    experience: 7,
    priceRange: { min: 2000, max: 8000 },
    bio: 'Wall textures, POP designs, and waterproof coatings.',
    rating: 4.5,
    reviewCount: 30,
    completedJobs: 52,
    isVerified: true
  },
  {
    name: 'Bashir Umar',
    email: 'bashir@skillconnect.com',
    skills: ['cleaner'],
    experience: 4,
    priceRange: { min: 1500, max: 6000 },
    bio: 'Home and office deep cleaning. Post-construction cleanup.',
    rating: 4.1,
    reviewCount: 15,
    completedJobs: 25,
    isVerified: true
  },
  {
    name: 'Kabiru Adamu',
    email: 'kabiru@skillconnect.com',
    skills: ['mason'],
    experience: 8,
    priceRange: { min: 3500, max: 18000 },
    bio: 'Foundation, columns, and finishing work. 8 years experience.',
    rating: 4.6,
    reviewCount: 33,
    completedJobs: 58,
    isVerified: false
  },
  {
    name: 'Tijjani Hassan',
    email: 'tijjani@skillconnect.com',
    skills: ['mechanic'],
    experience: 6,
    priceRange: { min: 4000, max: 20000 },
    bio: 'Motorcycle and tricycle (Keke) repairs. Spare parts available.',
    rating: 4.3,
    reviewCount: 20,
    completedJobs: 38,
    isVerified: false
  },
  {
    name: 'Salisu Mohammed',
    email: 'salisu@skillconnect.com',
    skills: ['electrician'],
    experience: 5,
    priceRange: { min: 2500, max: 12000 },
    bio: 'CCTV installation, smart home wiring, and inverter setup.',
    rating: 4.4,
    reviewCount: 24,
    completedJobs: 42,
    isVerified: false
  },
  {
    name: 'Zubairu Kaita',
    email: 'zubairu@skillconnect.com',
    skills: ['plumber'],
    experience: 7,
    priceRange: { min: 3000, max: 15000 },
    bio: 'Borehole drilling and pump installation specialist.',
    rating: 4.5,
    reviewCount: 28,
    completedJobs: 48,
    isVerified: false
  },
  {
    name: 'Nura Maigari',
    email: 'nura@skillconnect.com',
    skills: ['carpenter'],
    experience: 9,
    priceRange: { min: 5000, max: 25000 },
    bio: 'School and office furniture. Bulk orders welcome.',
    rating: 4.7,
    reviewCount: 36,
    completedJobs: 60,
    isVerified: false
  },
  {
    name: 'Farouk Idris',
    email: 'farouk@skillconnect.com',
    skills: ['welder'],
    experience: 8,
    priceRange: { min: 4500, max: 22000 },
    bio: 'Industrial and domestic welding. Aluminium and iron works.',
    rating: 4.6,
    reviewCount: 32,
    completedJobs: 55,
    isVerified: false
  },
  {
    name: 'Rabiu Danmusa',
    email: 'rabiu@skillconnect.com',
    skills: ['painter'],
    experience: 6,
    priceRange: { min: 2000, max: 8000 },
    bio: 'Signage painting, wall murals, and shop fronts.',
    rating: 4.2,
    reviewCount: 18,
    completedJobs: 32,
    isVerified: false
  },
  {
    name: 'Sani Dutsinma',
    email: 'sani@skillconnect.com',
    skills: ['mason'],
    experience: 10,
    priceRange: { min: 3500, max: 18000 },
    bio: 'Renovation and remodeling specialist. Free site inspection.',
    rating: 4.8,
    reviewCount: 40,
    completedJobs: 68,
    isVerified: false
  }
];

const clients = [
  {
    name: 'Demo Client',
    email: 'client@demo.com',
    phone: '+2348012345678'
  },
  {
    name: 'Aisha Musa',
    email: 'aisha@demo.com',
    phone: '+2348098765432'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop database
    console.log('Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('Database cleared ✅');

    // Create superadmin
    console.log('Creating admin...');
    await User.create({
      name: 'Super Admin',
      email: 'admin@skillconnect.com',
      password: 'admin2026',
      phone: '08000000000',
      role: 'admin',
      location: { city: 'Dutsin-Ma', state: 'Katsina State', type: 'Point', coordinates: [7.6017, 12.9908] }
    });
    console.log('Admin created ✅');

    // Passwords will be hashed by the User model pre-save hook
    // Do NOT hash manually here - that causes double-hashing
    const workerPassword = 'password123';
    const clientPassword = 'demo1234';

    // Create workers
    console.log('Creating workers...');
    const workerPromises = workers.map((worker, index) => {
      const coordinates = addRandomOffset();
      return User.create({
        name: worker.name,
        email: worker.email,
        password: workerPassword,
        role: 'worker',
        skills: worker.skills,
        bio: worker.bio,
        experience: worker.experience,
        priceRange: worker.priceRange,
        rating: worker.rating,
        reviewCount: worker.reviewCount,
        completedJobs: worker.completedJobs,
        isVerified: worker.isVerified,
        availability: true,
        isVisible: true,
        lastSeen: new Date(),
        lastLocationUpdate: new Date(),
        avatarColor: avatarColors[index % avatarColors.length],
        location: {
          address: 'Dutsin-Ma',
          city: 'Dutsin-Ma',
          state: 'Katsina State',
          type: 'Point',
          coordinates: coordinates
        },
        legacyCoordinates: { lat: coordinates[1], lng: coordinates[0] }
      });
    });
    await Promise.all(workerPromises);
    console.log(`Created ${workers.length} workers ✅`);

    // Create clients
    console.log('Creating clients...');
    const clientPromises = clients.map(client => {
      const coordinates = addRandomOffset();
      return User.create({
        name: client.name,
        email: client.email,
        password: clientPassword,
        role: 'client',
        phone: client.phone,
        location: {
          address: 'Dutsin-Ma',
          city: 'Dutsin-Ma',
          state: 'Katsina State',
          type: 'Point',
          coordinates: coordinates
        },
        legacyCoordinates: { lat: coordinates[1], lng: coordinates[0] }
      });
    });
    await Promise.all(clientPromises);
    console.log(`Created ${clients.length} clients ✅`);

    // Create sample bookings
    console.log('Creating sample bookings...');
    const createdWorkers = await User.find({ role: 'worker' });
    const createdClients = await User.find({ role: 'client' });

    console.log(`Found ${createdWorkers.length} workers and ${createdClients.length} clients`);

    if (createdWorkers.length > 0 && createdClients.length > 0) {
      const sampleBookings = [
        {
          client: createdClients[0]._id,
          worker: createdWorkers[0]._id,
          service: createdWorkers[0].skills[0],
          description: 'my toilet pipe is leaking and i need some assistence',
          date: new Date(),
          status: 'completed',
          price: 5000,
          address: 'Dutsin-Ma'
        },
        {
          client: createdClients[1]._id,
          worker: createdWorkers[1]._id,
          service: createdWorkers[1].skills[0],
          description: 'Need electrical wiring for my new apartment',
          date: new Date(),
          status: 'pending',
          price: 8000,
          address: 'Dutsin-Ma'
        }
      ];
      await Booking.create(sampleBookings);
      console.log('Created sample bookings ✅');
    } else {
      console.log('Skipping bookings - not enough workers or clients');
    }

    console.log('\nSeed completed successfully! ✅');
    console.log('\nDemo accounts:');
    console.log('Workers: email = [name]@skillconnect.com, password = password123');
    console.log('Clients: client@demo.com / aisha@demo.com, password = demo1234');
    console.log('Admin: admin@skillconnect.com, password = admin2026');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
