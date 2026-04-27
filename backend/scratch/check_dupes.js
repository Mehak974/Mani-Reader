const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const guests = await prisma.guestUser.findMany({
    where: { deviceId: 'dv_eo2bkv6joxrmofxhyjv' }
  });
  console.log(`Found ${guests.length} records for deviceId: dv_eo2bkv6joxrmofxhyjv`);
  process.exit(0);
}

check();
