import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'john@ballup.com' },
    update: {},
    create: {
      email: 'john@ballup.com',
      username: 'john_shooter',
      password: hashedPassword,
      skillLevel: 'intermediate',
      preferredPosition: 'Guard',
      bio: 'Love playing basketball every weekend!',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@ballup.com' },
    update: {},
    create: {
      email: 'sarah@ballup.com',
      username: 'sarah_hoops',
      password: hashedPassword,
      skillLevel: 'advanced',
      preferredPosition: 'Forward',
      bio: 'Former college player, always looking for competitive games.',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'mike@ballup.com' },
    update: {},
    create: {
      email: 'mike@ballup.com',
      username: 'mike_dunker',
      password: hashedPassword,
      skillLevel: 'beginner',
      preferredPosition: 'Center',
      bio: 'New to basketball, eager to learn and improve!',
    },
  });

  // Create sample locations
  const location1 = await prisma.location.create({
    data: {
      name: 'Central Park Basketball Court',
      address: '123 Park Ave, New York, NY 10001',
      latitude: 40.7831,
      longitude: -73.9712,
      description: 'Outdoor court with great lighting and city views',
      amenities: ['lighting', 'water fountain', 'outdoor'],
      createdBy: user1.id,
    }
  });

  const location2 = await prisma.location.create({
    data: {
      name: 'Community Center Indoor Court',
      address: '456 Community St, New York, NY 10002',
      latitude: 40.7589,
      longitude: -73.9851,
      description: 'Climate-controlled indoor court with professional flooring',
      amenities: ['indoor', 'parking', 'restrooms', 'seating'],
      createdBy: user2.id,
    }
  });

  const location3 = await prisma.location.create({
    data: {
      name: 'Riverside Park Courts',
      address: '789 Riverside Dr, New York, NY 10003',
      latitude: 40.7956,
      longitude: -73.9722,
      description: 'Multiple outdoor courts by the river',
      amenities: ['outdoor', 'multiple courts', 'water fountain', 'lighting'],
      createdBy: user1.id,
    }
  });

  // Create sample games
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(19, 30, 0, 0); // 7:30 PM day after tomorrow

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(17, 0, 0, 0); // 5 PM next week

  const game1 = await prisma.game.create({
    data: {
      locationId: location1.id,
      creatorId: user1.id,
      scheduledTime: tomorrow,
      duration: 120,
      maxPlayers: 10,
      currentPlayers: 3,
      skillLevelRequired: 'intermediate',
      description: 'Casual pickup game, all skill levels welcome! Looking for some good competition.',
      status: 'scheduled'
    }
  });

  const game2 = await prisma.game.create({
    data: {
      locationId: location2.id,
      creatorId: user2.id,
      scheduledTime: dayAfter,
      duration: 90,
      maxPlayers: 8,
      currentPlayers: 2,
      skillLevelRequired: 'beginner',
      description: 'Beginner-friendly game, come learn and have fun!',
      status: 'scheduled'
    }
  });

  const game3 = await prisma.game.create({
    data: {
      locationId: location3.id,
      creatorId: user1.id,
      scheduledTime: nextWeek,
      duration: 150,
      maxPlayers: 12,
      currentPlayers: 1,
      skillLevelRequired: 'advanced',
      description: 'Competitive game for experienced players. Bring your A-game!',
      status: 'scheduled'
    }
  });

  // Add participants to games
  await prisma.gameParticipant.createMany({
    data: [
      { gameId: game1.id, userId: user1.id, status: 'confirmed' },
      { gameId: game1.id, userId: user2.id, status: 'confirmed' },
      { gameId: game1.id, userId: user3.id, status: 'confirmed' },
      
      { gameId: game2.id, userId: user2.id, status: 'confirmed' },
      { gameId: game2.id, userId: user3.id, status: 'confirmed' },
      
      { gameId: game3.id, userId: user1.id, status: 'confirmed' },
    ]
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${3} users, ${3} locations, and ${3} games`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });