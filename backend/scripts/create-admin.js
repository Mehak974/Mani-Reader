'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@manireader.com';
  const password = 'Mani#@!321Reader';

  console.log(`\n👑 Starting Admin Creation for: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        isVip: true
      },
      create: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isVip: true
      }
    });

    console.log(`\n✅ SUCCESS! Admin account created/updated.`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Role: ${user.role}\n`);

  } catch (err) {
    console.error('\n❌ FAILED to create admin:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
