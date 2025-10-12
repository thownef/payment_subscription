import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if user exists
  const user = await prisma.user.findFirst()
  
  if (user) {
    await prisma.emailSetting.create({
      data: {
        userId: user.id,
        fromName: 'System',
        fromAddress: 'noreply@example.com',
        username: 'system',
        password: 'password',
        host: 'smtp.example.com',
        port: 587,
        encryption: 'tls',
        cc: ''
      }
    })
    console.log('Email setting created for user:', user.id)
  } else {
    console.log('No user found, skipping email setting creation')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
