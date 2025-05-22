import bcrypt from 'bcryptjs'

export const encryptPassword = async (password: string) => {
  const encryptedPassword = await bcrypt.hash(password, 8)
  return encryptedPassword
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}
