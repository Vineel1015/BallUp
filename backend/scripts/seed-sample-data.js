#!/usr/bin/env node

// Seed database with sample data for testing
// Run with: node scripts/seed-sample-data.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.gameParticipant.deleteMany();
    await prisma.game.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleaned existing data\n');

    // Create sample users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          skillLevel: 'intermediate',
          preferredPosition: 'Point Guard',
          bio: 'Love playing pickup basketball!',
          latitude: 40.7831,
          longitude: -73.9712,
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'mike.jordan@example.com',
          username: 'mikej23',
          password: hashedPassword,
          firstName: 'Mike',
          lastName: 'Jordan',
          skillLevel: 'advanced',
          preferredPosition: 'Shooting Guard',
          bio: 'Former college player, competitive games only!',
          latitude: 40.7589,
          longitude: -73.9851,
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'sarah.wilson@example.com',
          username: 'sarahw',
          password: hashedPassword,
          firstName: 'Sarah',
          lastName: 'Wilson',
          skillLevel: 'beginner',
          preferredPosition: 'Forward',
          bio: 'Just getting started, looking for friendly games!',
          latitude: 40.7951,
          longitude: -73.9712,
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'admin@ballup.com',
          username: 'admin',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          skillLevel: 'intermediate',
          role: 'admin',
          bio: 'BallUp administrator',
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'alex.carter@example.com',
          username: 'alexc',
          password: hashedPassword,
          firstName: 'Alex',
          lastName: 'Carter',
          skillLevel: 'intermediate',
          preferredPosition: 'Center',
          bio: 'Love playing defense and rebounds!',
          latitude: 40.7489,
          longitude: -73.9680,
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'maria.lopez@example.com',
          username: 'marialop',
          password: hashedPassword,
          firstName: 'Maria',
          lastName: 'Lopez',
          skillLevel: 'advanced',
          preferredPosition: 'Point Guard',
          bio: 'Fast breaks and assists are my specialty!',
          latitude: 40.7505,
          longitude: -73.9934,
          isVerified: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'kevin.brown@example.com',
          username: 'kbrown',
          password: hashedPassword,
          firstName: 'Kevin',
          lastName: 'Brown',
          skillLevel: 'beginner',
          preferredPosition: 'Forward',
          bio: 'New to the game but eager to learn!',
          latitude: 40.7282,
          longitude: -74.0776,
          isVerified: true,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} sample users\n`);

    // Create sample locations
    console.log('🏀 Creating sample courts...');
    const locations = await Promise.all([
      prisma.location.create({
        data: {
          name: 'Central Park Basketball Courts',
          address: 'Central Park, New York, NY 10024',
          description: 'Popular outdoor courts in the heart of Manhattan',
          latitude: 40.7829,
          longitude: -73.9654,
          courtType: 'outdoor',
          surfaceType: 'asphalt',
          hoopCount: 4,
          amenities: ['free', 'multiple courts', 'lighting', 'water fountain'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[0].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.5,
          totalRatings: 45,
          totalGames: 127,
        },
      }),
      prisma.location.create({
        data: {
          name: 'Brooklyn Bridge Park Courts',
          address: 'Brooklyn Bridge Park, Brooklyn, NY 11201',
          description: 'Scenic waterfront courts with Manhattan skyline views',
          latitude: 40.7023,
          longitude: -73.9969,
          courtType: 'outdoor',
          surfaceType: 'concrete',
          hoopCount: 2,
          amenities: ['scenic views', 'free', 'lighting'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[1].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.8,
          totalRatings: 32,
          totalGames: 89,
        },
      }),
      prisma.location.create({
        data: {
          name: 'Rutgers Recreation Center',
          address: 'Rutgers University, New Brunswick, NJ 08901',
          description: 'Indoor courts at Rutgers University recreation center',
          latitude: 40.5008,
          longitude: -74.4474,
          courtType: 'indoor',
          surfaceType: 'hardwood',
          hoopCount: 6,
          amenities: ['indoor', 'air conditioning', 'locker rooms', 'parking'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[2].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.7,
          totalRatings: 28,
          totalGames: 156,
        },
      }),
      prisma.location.create({
        data: {
          name: 'West Village Community Court',
          address: '123 Community St, New York, NY 10014',
          description: 'Local community center with indoor court',
          latitude: 40.7308,
          longitude: -74.0023,
          courtType: 'indoor',
          surfaceType: 'hardwood',
          hoopCount: 2,
          amenities: ['indoor', 'air conditioning', 'water fountain', 'restrooms'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[0].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.2,
          totalRatings: 15,
          totalGames: 43,
        },
      }),
      prisma.location.create({
        data: {
          name: 'Manhattan Sports Complex',
          address: '456 Sports Ave, New York, NY 10001',
          description: 'Premium indoor facility with multiple courts',
          latitude: 40.7505,
          longitude: -73.9934,
          courtType: 'indoor',
          surfaceType: 'hardwood',
          hoopCount: 8,
          amenities: ['premium facility', 'air conditioning', 'locker rooms', 'parking', 'pro shop'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[4].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.9,
          totalRatings: 67,
          totalGames: 234,
        },
      }),
      prisma.location.create({
        data: {
          name: 'Riverside Park Courts',
          address: 'Riverside Drive, New York, NY 10025',
          description: 'Scenic outdoor courts along the Hudson River',
          latitude: 40.7884,
          longitude: -73.9857,
          courtType: 'outdoor',
          surfaceType: 'asphalt',
          hoopCount: 6,
          amenities: ['scenic views', 'free', 'multiple courts', 'benches'],
          isActive: true,
          isVerified: true,
          isApproved: true,
          createdBy: users[5].id,
          approvedBy: users[3].id,
          approvedAt: new Date(),
          rating: 4.3,
          totalRatings: 23,
          totalGames: 78,
        },
      }),
    ]);

    console.log(`✅ Created ${locations.length} sample courts\n`);

    // Create sample games
    console.log('🎮 Creating sample games...');
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const games = await Promise.all([
      prisma.game.create({
        data: {
          title: 'Morning Pickup at Central Park',
          description: 'Early morning game for the dedicated players. All skill levels welcome!',
          scheduledAt: inTwoHours,
          maxPlayers: 10,
          currentPlayers: 6,
          skillLevel: 'any',
          gameType: 'pickup',
          duration: 90,
          locationId: locations[0].id,
          creatorId: users[0].id,
          status: 'scheduled',
        },
      }),
      prisma.game.create({
        data: {
          title: 'Competitive 5v5 Tournament',
          description: 'High-level competitive game. Advanced players only!',
          scheduledAt: tomorrow,
          maxPlayers: 10,
          currentPlayers: 8,
          skillLevel: 'advanced',
          gameType: 'tournament',
          duration: 120,
          locationId: locations[1].id,
          creatorId: users[1].id,
          status: 'scheduled',
          requiresApproval: true,
        },
      }),
      prisma.game.create({
        data: {
          title: 'Beginner Friendly Session',
          description: 'Perfect for newcomers to learn and have fun! Teaching and coaching included.',
          scheduledAt: nextWeek,
          maxPlayers: 12,
          currentPlayers: 4,
          skillLevel: 'beginner',
          gameType: 'pickup',
          duration: 60,
          locationId: locations[2].id,
          creatorId: users[2].id,
          status: 'scheduled',
        },
      }),
      prisma.game.create({
        data: {
          title: 'Evening Scrimmage',
          description: 'Casual evening game at the community center',
          scheduledAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          maxPlayers: 8,
          currentPlayers: 5,
          skillLevel: 'intermediate',
          gameType: 'scrimmage',
          duration: 75,
          locationId: locations[3].id,
          creatorId: users[3].id,
          status: 'scheduled',
        },
      }),
      prisma.game.create({
        data: {
          title: 'Weekend Warriors Tournament',
          description: 'Competitive weekend tournament at premium facility',
          scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          maxPlayers: 16,
          currentPlayers: 12,
          skillLevel: 'advanced',
          gameType: 'tournament',
          duration: 180,
          locationId: locations[4].id,
          creatorId: users[5].id,
          status: 'scheduled',
          requiresApproval: true,
        },
      }),
      prisma.game.create({
        data: {
          title: 'Riverside Pickup',
          description: 'Casual pickup game with river views',
          scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          maxPlayers: 12,
          currentPlayers: 7,
          skillLevel: 'any',
          gameType: 'pickup',
          duration: 120,
          locationId: locations[5].id,
          creatorId: users[4].id,
          status: 'scheduled',
        },
      }),
    ]);

    console.log(`✅ Created ${games.length} sample games\n`);

    // Add game participants
    console.log('👫 Adding game participants...');
    const participants = await Promise.all([
      // Game 1 participants
      prisma.gameParticipant.create({
        data: { gameId: games[0].id, userId: users[1].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[0].id, userId: users[2].id },
      }),
      // Game 2 participants
      prisma.gameParticipant.create({
        data: { gameId: games[1].id, userId: users[0].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[1].id, userId: users[2].id },
      }),
      // Game 3 participants
      prisma.gameParticipant.create({
        data: { gameId: games[2].id, userId: users[0].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[2].id, userId: users[1].id },
      }),
      // Game 4 (Evening Scrimmage) participants
      prisma.gameParticipant.create({
        data: { gameId: games[3].id, userId: users[4].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[3].id, userId: users[5].id },
      }),
      // Weekend Tournament participants
      prisma.gameParticipant.create({
        data: { gameId: games[4].id, userId: users[1].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[4].id, userId: users[5].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[4].id, userId: users[2].id },
      }),
      // Riverside pickup participants
      prisma.gameParticipant.create({
        data: { gameId: games[5].id, userId: users[0].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[5].id, userId: users[2].id },
      }),
      prisma.gameParticipant.create({
        data: { gameId: games[5].id, userId: users[6].id },
      }),
    ]);

    console.log(`✅ Added ${participants.length} game participants\n`);

    // Test the seeded data
    console.log('🧪 Testing seeded data...');
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const locationCount = await prisma.location.count();
    const participantCount = await prisma.gameParticipant.count();

    console.log('📊 Final counts:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Games: ${gameCount}`);
    console.log(`   - Locations: ${locationCount}`);
    console.log(`   - Participants: ${participantCount}\n`);

    // Test our basic functions
    console.log('🔍 Testing nearby search functions...');
    try {
      const nearbyGames = await prisma.$queryRaw`
        SELECT * FROM find_nearby_games_basic(40.7831, -73.9712, 10) LIMIT 3
      `;
      console.log(`✅ Found ${nearbyGames.length} nearby games`);
      
      const nearbyCourts = await prisma.$queryRaw`
        SELECT * FROM find_nearby_courts_basic(40.7831, -73.9712, 20) LIMIT 5  
      `;
      console.log(`✅ Found ${nearbyCourts.length} nearby courts`);
    } catch (error) {
      console.log('⚠️  Geospatial functions need manual setup in Supabase dashboard');
    }

    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Email: mike.jordan@example.com'); 
    console.log('   Email: sarah.wilson@example.com');
    console.log('   Email: admin@ballup.com');
    console.log('   Email: alex.carter@example.com');
    console.log('   Email: maria.lopez@example.com');
    console.log('   Email: kevin.brown@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 Ready to start the server: npm run dev');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedSampleData();