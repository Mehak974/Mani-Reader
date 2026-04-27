const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const guests = await prisma.guestUser.findMany({
    orderBy: { lastActive: 'desc' },
    take: 10
  });
  console.log('Top 10 Guests:');
  guests.forEach(g => {
    console.log(`- ID: ${g.id}, IP: ${g.ip}, Device: ${g.deviceId}`);
  });
  process.exit(0);
}

check();
