const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found.`);
  } else {
    console.log(`User ${email} found. Current role: ${user.role}`);
    if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log(`Updated ${email} to ADMIN role.`);
    } else {
      console.log(`${email} is already an ADMIN.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
