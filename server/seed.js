import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// City coordinates mapping (GeoJSON format: [longitude, latitude])
const cityCoordinates = {
  'Lagos': { coordinates: [3.3792, 6.5244] },
  'Katsina': { coordinates: [7.6017, 12.9908] },
  'Enugu': { coordinates: [7.5464, 6.4584] },
  'Kano': { coordinates: [8.5920, 12.0022] },
  'Ibadan': { coordinates: [3.9470, 7.3775] },
  'Kaduna': { coordinates: [7.4383, 10.5222] },
  'Abuja': { coordinates: [7.3986, 9.0765] },
  'Port Harcourt': { coordinates: [7.0498, 4.8156] },
  'Owerri': { coordinates: [7.0350, 5.4836] }
};

// Add random offset to prevent perfect overlap (±0.01 degrees ~ 1km)
function addRandomOffset(coordinates) {
  const offset = 0.01;
  return [
    coordinates[0] + (Math.random() - 0.5) * offset * 2,
    coordinates[1] + (Math.random() - 0.5) * offset * 2
  ];
}

const workers = [
  {
    name: 'Emeka Okafor',
    email: 'emeka@demo.com',
    skills: ['plumber'],
    location: 'Lagos',
    experience: 8,
    priceRange: { min: 3000, max: 15000 },
    bio: 'Professional plumber with 8 years of experience in residential and commercial plumbing. Expert in pipe fitting, leak repairs, and bathroom installations. Available for emergency repairs and maintenance work.',
    rating: 4.7,
    reviewCount: 32,
    completedJobs: 45
  },
  {
    name: 'Musa Abdullahi',
    email: 'musa@demo.com',
    skills: ['electrician'],
    location: 'Katsina',
    experience: 5,
    priceRange: { min: 2500, max: 12000 },
    bio: 'Certified electrician specializing in household electrical installations, wiring, and repairs. Experienced in solar panel installations and inverter setups. Committed to safety and quality workmanship.',
    rating: 4.5,
    reviewCount: 18,
    completedJobs: 28
  },
  {
    name: 'Chidi Nwosu',
    email: 'chidi@demo.com',
    skills: ['carpenter'],
    location: 'Enugu',
    experience: 10,
    priceRange: { min: 5000, max: 25000 },
    bio: 'Master carpenter with a decade of experience in furniture making, woodwork, and home fittings. Specializes in custom cabinets, wardrobes, and interior woodwork. Known for precision and durability.',
    rating: 4.9,
    reviewCount: 40,
    completedJobs: 78
  },
  {
    name: 'Aminu Bello',
    email: 'aminu@demo.com',
    skills: ['painter'],
    location: 'Kano',
    experience: 3,
    priceRange: { min: 2000, max: 8000 },
    bio: 'Skilled painter offering interior and exterior painting services. Experienced in decorative finishes, wall textures, and color consultation. Clean, efficient, and detail-oriented work.',
    rating: 4.2,
    reviewCount: 12,
    completedJobs: 15
  },
  {
    name: 'Tunde Adeyemi',
    email: 'tunde@demo.com',
    skills: ['mechanic'],
    location: 'Ibadan',
    experience: 7,
    priceRange: { min: 4000, max: 20000 },
    bio: 'Automotive mechanic with expertise in engine repairs, diagnostics, and maintenance. Works on all vehicle types including cars, buses, and motorcycles. Provides reliable and honest service.',
    rating: 4.6,
    reviewCount: 25,
    completedJobs: 52
  },
  {
    name: 'Yusuf Garba',
    email: 'yusuf@demo.com',
    skills: ['mason'],
    location: 'Kaduna',
    experience: 6,
    priceRange: { min: 3500, max: 18000 },
    bio: 'Experienced mason specializing in bricklaying, plastering, and concrete work. Expert in building foundations, walls, and structural repairs. Delivers sturdy and long-lasting construction work.',
    rating: 4.4,
    reviewCount: 20,
    completedJobs: 38
  },
  {
    name: 'Biodun Fashola',
    email: 'biodun@demo.com',
    skills: ['cleaner'],
    location: 'Abuja',
    experience: 2,
    priceRange: { min: 1500, max: 6000 },
    bio: 'Professional cleaning service provider offering residential and office cleaning. Services include deep cleaning, post-construction cleaning, and regular maintenance. Reliable and thorough.',
    rating: 4.1,
    reviewCount: 8,
    completedJobs: 12
  },
  {
    name: 'Ifeanyi Obi',
    email: 'ifeanyi@demo.com',
    skills: ['welder'],
    location: 'Port Harcourt',
    experience: 9,
    priceRange: { min: 4500, max: 22000 },
    bio: 'Expert welder with 9 years of experience in metal fabrication, gate construction, and industrial welding. Specializes in stainless steel work, security doors, and custom metal designs.',
    rating: 4.8,
    reviewCount: 35,
    completedJobs: 62
  },
  {
    name: 'Suleiman Dankore',
    email: 'suleiman@demo.com',
    skills: ['electrician'],
    location: 'Katsina',
    experience: 4,
    priceRange: { min: 2000, max: 10000 },
    bio: 'Electrician providing quality electrical services for homes and businesses. Skilled in circuit installations, lighting setups, and electrical troubleshooting. Affordable rates and prompt service.',
    rating: 3.9,
    reviewCount: 14,
    completedJobs: 22
  },
  {
    name: 'Kelechi Eze',
    email: 'kelechi@demo.com',
    skills: ['carpenter'],
    location: 'Owerri',
    experience: 6,
    priceRange: { min: 3000, max: 15000 },
    bio: 'Talented carpenter creating beautiful furniture and woodwork. Specializes in chairs, tables, beds, and kitchen cabinets. Combines traditional craftsmanship with modern designs.',
    rating: 4.3,
    reviewCount: 19,
    completedJobs: 33
  }
];

const clients = [
  {
    name: 'Demo Client',
    email: 'client@demo.com',
    phone: '+2348012345678',
    location: 'Lagos'
  },
  {
    name: 'Aisha Musa',
    email: 'aisha@demo.com',
    phone: '+2348098765432',
    location: 'Abuja'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});

    // Create superadmin
    console.log('Creating admin...');
    const adminExists = await User.findOne({ email: 'admin@skillconnect.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@skillconnect.com',
        password: 'admin2026',
        phone: '08000000000',
        role: 'admin',
        location: { city: 'Katsina', state: 'Katsina State', type: 'Point', coordinates: [7.6017, 12.9908] }
      });
      console.log('Admin created ✅');
    }

    // Passwords will be hashed by the User model pre-save hook
    // Do NOT hash manually here - that causes double-hashing
    const workerPassword = 'password123';
    const clientPassword = 'demo1234';

    // Create workers
    console.log('Creating workers...');
    const workerPromises = workers.map(worker => {
      const cityData = cityCoordinates[worker.location];
      const coordinates = addRandomOffset(cityData.coordinates);
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
        availability: true,
        lastSeen: new Date(),
        location: {
          address: worker.location,
          city: worker.location,
          state: worker.location,
          type: 'Point',
          coordinates: coordinates
        },
        legacyCoordinates: { lat: coordinates[1], lng: coordinates[0] }
      });
    });
    await Promise.all(workerPromises);
    console.log(`Created ${workers.length} workers`);

    // Create clients
    console.log('Creating clients...');
    const clientPromises = clients.map(client => {
      const cityData = cityCoordinates[client.location] || { coordinates: [7.3986, 9.0765] }; // Default to Abuja
      const coordinates = addRandomOffset(cityData.coordinates);
      return User.create({
        name: client.name,
        email: client.email,
        password: clientPassword,
        role: 'client',
        phone: client.phone,
        location: {
          address: client.location,
          city: client.location,
          state: client.location,
          type: 'Point',
          coordinates: coordinates
        },
        legacyCoordinates: { lat: coordinates[1], lng: coordinates[0] }
      });
    });
    await Promise.all(clientPromises);
    console.log(`Created ${clients.length} clients`);

    console.log('\nSeed completed successfully!');
    console.log('\nDemo accounts:');
    console.log('Workers: email = [name]@demo.com, password = password123');
    console.log('Clients: client@demo.com / aisha@demo.com, password = demo1234');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
