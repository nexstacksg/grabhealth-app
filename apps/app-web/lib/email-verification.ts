import { db } from './db-adapter'
import { prisma } from './db-adapter'

// Generate a 4-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Create a verification code for a user
export async function createVerificationCode(userId: number, email: string, type: string = 'login') {
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  // Use Prisma if enabled, otherwise use Neon
  if (process.env.USE_PRISMA === 'true') {
    // Mark any existing codes as used
    await prisma.emailVerification.updateMany({
      where: {
        userId,
        type,
        verified: false
      },
      data: {
        verified: true
      }
    })
    
    // Create new verification code
    return await prisma.emailVerification.create({
      data: {
        userId,
        email,
        code,
        type,
        expiresAt
      }
    })
  }
  
  // Neon implementation would go here
  // For now, we'll just return a mock object
  return {
    id: 1,
    userId,
    email,
    code,
    type,
    expiresAt,
    verified: false,
    attempts: 0,
    createdAt: new Date()
  }
}

// Verify a code
export async function verifyCode(email: string, code: string, type: string = 'login') {
  if (process.env.USE_PRISMA === 'true') {
    // Find the verification code
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        type,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })
    
    if (!verification) {
      return { success: false, message: 'Invalid or expired code' }
    }
    
    // Check attempts
    if (verification.attempts >= 3) {
      return { success: false, message: 'Too many attempts. Please request a new code.' }
    }
    
    // Increment attempts
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { attempts: verification.attempts + 1 }
    })
    
    // If code matches, mark as verified
    if (verification.code === code) {
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true }
      })
      
      return { 
        success: true, 
        userId: verification.userId,
        message: 'Code verified successfully' 
      }
    }
    
    return { success: false, message: 'Invalid code' }
  }
  
  // Neon implementation would go here
  // For now, return mock success
  return { success: true, userId: 1, message: 'Code verified successfully' }
}

// Send verification email (placeholder - you'll need to implement email service)
export async function sendVerificationEmail(email: string, code: string) {
  // This is where you'd integrate with an email service like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  // - Resend
  
  console.log(`
    ========================================
    VERIFICATION EMAIL
    To: ${email}
    Code: ${code}
    
    Your verification code is: ${code}
    This code will expire in 10 minutes.
    ========================================
  `)
  
  // In production, you'd actually send the email here
  return true
}