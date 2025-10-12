import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.emailSetting.create({
    data: {
      userId: 1,
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
