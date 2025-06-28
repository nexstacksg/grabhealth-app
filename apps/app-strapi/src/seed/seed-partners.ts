/**
 * Seed script to populate partners, services, availability, and days off
 */

import type { Core } from '@strapi/strapi';
import { partners, services, availabilities, daysOff } from './partner-seed';

export default async function seedPartners(strapi: Core.Strapi) {
  console.log('🌱 Starting partner seeding...');

  try {
    // Store created partner IDs
    const createdPartners = [];

    // 1. Create Partners
    console.log('📍 Creating partners...');
    for (const partnerData of partners) {
      // Check for existing partner using entityService
      const existingPartners = await strapi.entityService.findMany('api::partner.partner', {
        filters: { email: partnerData.email },
        limit: 1
      } as any);

      if (!existingPartners || existingPartners.length === 0) {
        const partner = await strapi.entityService.create('api::partner.partner', {
          data: {
            ...partnerData,
            publishedAt: new Date() // Publish immediately
          }
        } as any);
        createdPartners.push(partner);
        console.log(`✅ Created partner: ${partner.name}`);
      } else {
        createdPartners.push(existingPartners[0]);
        console.log(`ℹ️  Partner already exists: ${existingPartners[0].name}`);
      }
    }

    // 2. Create Services for each partner
    console.log('\n🏥 Creating services...');
    for (const serviceGroup of services) {
      const partner = createdPartners[serviceGroup.partnerIndex];
      
      for (const serviceData of serviceGroup.services) {
        // Check for existing service
        const existingServices = await strapi.entityService.findMany('api::service.service', {
          filters: { 
            name: serviceData.name,
            partner: { id: partner.id }
          },
          populate: ['partner'],
          limit: 1
        } as any);

        if (!existingServices || existingServices.length === 0) {
          const service = await strapi.entityService.create('api::service.service', {
            data: {
              ...serviceData,
              partner: partner.id, // This links the service to the partner
              publishedAt: new Date() // Publish immediately
            }
          } as any);
          console.log(`✅ Created service: ${service.name} for ${partner.name}`);
        } else {
          console.log(`ℹ️  Service already exists: ${existingServices[0].name} for ${partner.name}`);
        }
      }
    }

    // 3. Create Availability schedules
    console.log('\n⏰ Creating availability schedules...');
    for (const availabilityGroup of availabilities) {
      const partner = createdPartners[availabilityGroup.partnerIndex];

      for (const scheduleData of availabilityGroup.schedule) {
        const existingAvailabilities = await strapi.entityService.findMany('api::partner-availability.partner-availability', {
          filters: {
            partner: { id: partner.id },
            dayOfWeek: scheduleData.dayOfWeek,
            startTime: scheduleData.startTime
          },
          limit: 1
        } as any);

        if (!existingAvailabilities || existingAvailabilities.length === 0) {
          const availability = await strapi.entityService.create('api::partner-availability.partner-availability', {
            data: {
              ...scheduleData,
              partner: partner.id,
              isActive: true,
              publishedAt: new Date() // Publish immediately
            }
          } as any);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          console.log(`✅ Created availability: ${partner.name} - ${days[scheduleData.dayOfWeek]} ${scheduleData.startTime}-${scheduleData.endTime}`);
        } else {
          console.log(`ℹ️  Availability already exists for ${partner.name} on day ${scheduleData.dayOfWeek}`);
        }
      }
    }

    // 4. Create Days Off
    console.log('\n📅 Creating days off...');
    for (const daysOffGroup of daysOff) {
      const partner = createdPartners[daysOffGroup.partnerIndex];

      for (const dayOffData of daysOffGroup.daysOff) {
        const existingDaysOff = await strapi.entityService.findMany('api::partner-days-off.partner-days-off', {
          filters: {
            partner: { id: partner.id },
            date: dayOffData.date
          },
          limit: 1
        } as any);

        if (!existingDaysOff || existingDaysOff.length === 0) {
          const dayOff = await strapi.entityService.create('api::partner-days-off.partner-days-off', {
            data: {
              ...dayOffData,
              partner: partner.id,
              publishedAt: new Date() // Publish immediately
            }
          } as any);
          console.log(`✅ Created day off: ${partner.name} - ${dayOffData.date} (${dayOffData.reason})`);
        } else {
          console.log(`ℹ️  Day off already exists for ${partner.name} on ${dayOffData.date}`);
        }
      }
    }

    console.log('\n✨ Partner seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error during partner seeding:', error);
    return false;
  }
}