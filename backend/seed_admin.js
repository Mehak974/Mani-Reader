const { PrismaClient } = require('@prisma/client'); 
const bcrypt = require('bcryptjs'); 
const prisma = new PrismaClient(); 

async function run() { 
  const hashed = await bcrypt.hash('admin123', 12); 
  const email = 'admin@admin.com';
  const existing = await prisma.user.findUnique({where: {email}});
  if(existing) {
    await prisma.user.update({where: {email}, data: {password: hashed, role: 'ADMIN'}});
  } else {
    await prisma.user.create({data: {email, password: hashed, role: 'ADMIN'}});
  }
  console.log('Admin user created'); 
} 
run().catch(console.error).finally(()=>prisma.$disconnect());
