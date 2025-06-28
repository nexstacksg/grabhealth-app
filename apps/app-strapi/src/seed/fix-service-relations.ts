/**
 * Fix service-partner relations for existing data
 */

import type { Core } from '@strapi/strapi';

export default async function fixServiceRelations(strapi: Core.Strapi) {
  console.log('🔧 Fixing service-partner relations...');

  try {
    // Get all services
    const services = await strapi.entityService.findMany('api::service.service', {
      populate: {
        partner: true
      }
    } as any);

    console.log(`Found ${services.length} services to check`);

    // Get all partners
    const partners = await strapi.entityService.findMany('api::partner.partner', {
      fields: ['id', 'name', 'email']
    } as any);

    console.log(`Found ${partners.length} partners`);

    // Map partners by name for matching
    const partnerMap = new Map();
    partners.forEach(partner => {
      partnerMap.set(partner.name, partner);
    });

    // Service name to partner name mapping
    const servicePartnerMapping = {
      // Wellness TCM Clinic Services
      "Acupuncture Treatment": "Wellness TCM Clinic",
      "Cupping Therapy": "Wellness TCM Clinic",
      "Herbal Consultation": "Wellness TCM Clinic",
      "Full Body Tuina Massage": "Wellness TCM Clinic",
      
      // HealthFirst Medical Clinic Services
      "General Consultation": "HealthFirst Medical Clinic",
      "Health Screening Basic": "HealthFirst Medical Clinic",
      "Health Screening Premium": "HealthFirst Medical Clinic",
      "COVID-19 Vaccination": "HealthFirst Medical Clinic",
      "Minor Wound Treatment": "HealthFirst Medical Clinic",
      
      // SmileCare Dental Clinic Services
      "Dental Consultation": "SmileCare Dental Clinic",
      "Teeth Cleaning & Scaling": "SmileCare Dental Clinic",
      "Tooth Extraction": "SmileCare Dental Clinic",
      "Teeth Whitening": "SmileCare Dental Clinic",
      
      // ActiveLife Physiotherapy Services
      "Initial Assessment": "ActiveLife Physiotherapy",
      "Follow-up Treatment": "ActiveLife Physiotherapy",
      "Sports Injury Treatment": "ActiveLife Physiotherapy",
      "Dry Needling": "ActiveLife Physiotherapy"
    };

    let fixedCount = 0;

    for (const service of services) {
      // Check if service has no partner or wrong partner
      const expectedPartnerName = servicePartnerMapping[service.name];
      
      if (expectedPartnerName) {
        const expectedPartner = partnerMap.get(expectedPartnerName);
        const currentPartner = (service as any).partner;
        
        if (expectedPartner && (!currentPartner || currentPartner.id !== expectedPartner.id)) {
          // Update the service with correct partner
          await strapi.entityService.update('api::service.service', service.id, {
            data: {
              partner: expectedPartner.id
            }
          } as any);
          
          console.log(`✅ Fixed: ${service.name} -> ${expectedPartnerName}`);
          fixedCount++;
        }
      }
    }

    console.log(`\n✨ Fixed ${fixedCount} service-partner relations!`);
    return true;
  } catch (error) {
    console.error('❌ Error fixing service relations:', error);
    return false;
  }
}