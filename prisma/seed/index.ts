import { PrismaClient } from '@prisma/client'

export async function seedTenantData(prisma: PrismaClient) {
  try {
    await prisma.emailSetting.create({
      data: {
        userId: 1,
        fromName: 'System',
        fromAddress: 'system@example.com',
        username: 'system@example.com',
        password: 'your-email-password',
        host: 'smtp.example.com',
        port: 587,
        encryption: 'tls',
        cc: ''
      }
    })

    console.log('Seed data created successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
    throw error
  }
}
