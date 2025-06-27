import prisma from '../src/database/client';

async function seedPartners() {
  console.log('Partner seeding script...');
  
  try {
    // This script can be used to import partners from external sources
    // For now, partners should be managed through Strapi CMS
    console.log('ℹ️  Partners should be created and managed through Strapi CMS');
    console.log('ℹ️  No hardcoded partner data will be seeded');
    
    // You can add logic here to sync partners from Strapi if needed
    // Example:
    // const strapiPartners = await fetchPartnersFromStrapi();
    // await syncPartnersToDatabase(strapiPartners);
    
  } catch (error) {
    console.error('Error in partner seeding:', error);
    throw error;
  }
}

// Run the seed function
seedPartners()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });