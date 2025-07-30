import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Database ready for real user data...');
  
  // Database is ready to receive real data from the mobile app
  // No dummy data - users will create accounts and games through the app
  
  console.log('✅ Database initialized successfully');
  console.log('📱 Ready to accept real user registrations and game creation');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });