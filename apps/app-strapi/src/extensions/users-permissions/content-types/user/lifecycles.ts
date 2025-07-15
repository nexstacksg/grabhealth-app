import { Core } from '@strapi/strapi';

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Generate a unique referral code if not already set
    if (!data.referralCode) {
      data.referralCode = await generateUniqueReferralCode(event.strapi);
    }
  },
  
  async afterCreate(event) {
    const { result } = event;
    
    // Log the creation with upline info
    if (result.upline) {
      console.log(`New user ${result.email} created with upline ID: ${result.upline}`);
    }
  }
};

async function generateUniqueReferralCode(strapi: Core.Strapi): Promise<string> {
  let isUnique = false;
  let referralCode = '';
  
  while (!isUnique) {
    // Generate a 8-character alphanumeric code
    referralCode = generateRandomCode(8);
    
    // Check if this code already exists
    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { referralCode }
    });
    
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return referralCode;
}

function generateRandomCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}