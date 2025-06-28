/**
 * Manual script to fix service-partner relations
 * Run this after Strapi is fully started
 */

import type { Core } from '@strapi/strapi';

export default async function manualFixServices(strapi: Core.Strapi) {
  console.log('🔧 Manual fix for service-partner relations...');

  try {
    // First, let's delete all existing services to start fresh
    const existingServices = await strapi.entityService.findMany('api::service.service', {
      fields: ['id', 'documentId']
    } as any);

    console.log(`Found ${existingServices.length} existing services to remove`);

    // Delete all existing services
    for (const service of existingServices) {
      await strapi.entityService.delete('api::service.service', service.id);
    }

    console.log('✅ Removed all existing services');

    // Get all partners
    const partners = await strapi.entityService.findMany('api::partner.partner', {
      fields: ['id', 'documentId', 'name']
    } as any);

    console.log(`Found ${partners.length} partners`);

    // Create services with proper partner relations
    const servicesData = [
      // Wellness TCM Clinic Services
      {
        partnerName: "Wellness TCM Clinic",
        services: [
          {
            name: "Acupuncture Treatment",
            description: "Traditional acupuncture for pain relief and wellness",
            duration: 45,
            price: 80,
            category: "TCM",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 8
          },
          {
            name: "Cupping Therapy",
            description: "Traditional cupping for muscle tension and circulation",
            duration: 30,
            price: 60,
            category: "TCM",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 10
          },
          {
            name: "Herbal Consultation",
            description: "Personalized herbal medicine consultation and prescription",
            duration: 30,
            price: 50,
            category: "TCM",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 12
          },
          {
            name: "Full Body Tuina Massage",
            description: "Traditional Chinese therapeutic massage",
            duration: 60,
            price: 100,
            category: "TCM",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 6
          }
        ]
      },
      // HealthFirst Medical Clinic Services
      {
        partnerName: "HealthFirst Medical Clinic",
        services: [
          {
            name: "General Consultation",
            description: "General medical consultation with experienced GP",
            duration: 20,
            price: 40,
            category: "General Practice",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 30
          },
          {
            name: "Health Screening Basic",
            description: "Basic health screening package including blood test",
            duration: 45,
            price: 120,
            category: "Health Screening",
            isActive: true,
            requiresApproval: true,
            maxBookingsPerDay: 8
          },
          {
            name: "Health Screening Premium",
            description: "Comprehensive health screening with full blood panel",
            duration: 60,
            price: 280,
            category: "Health Screening",
            isActive: true,
            requiresApproval: true,
            maxBookingsPerDay: 5
          },
          {
            name: "COVID-19 Vaccination",
            description: "COVID-19 vaccination service",
            duration: 15,
            price: 35,
            category: "Vaccination",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 20
          },
          {
            name: "Minor Wound Treatment",
            description: "Treatment for minor cuts, wounds, and injuries",
            duration: 30,
            price: 80,
            category: "Minor Surgery",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 10
          }
        ]
      },
      // SmileCare Dental Clinic Services
      {
        partnerName: "SmileCare Dental Clinic",
        services: [
          {
            name: "Dental Consultation",
            description: "Initial dental examination and consultation",
            duration: 30,
            price: 50,
            category: "General Dentistry",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 15
          },
          {
            name: "Teeth Cleaning & Scaling",
            description: "Professional teeth cleaning and scaling",
            duration: 45,
            price: 120,
            category: "General Dentistry",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 10
          },
          {
            name: "Tooth Extraction",
            description: "Simple tooth extraction procedure",
            duration: 45,
            price: 150,
            category: "Oral Surgery",
            isActive: true,
            requiresApproval: true,
            maxBookingsPerDay: 5
          },
          {
            name: "Teeth Whitening",
            description: "Professional teeth whitening treatment",
            duration: 60,
            price: 350,
            category: "Cosmetic Dentistry",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 4
          }
        ]
      },
      // ActiveLife Physiotherapy Services
      {
        partnerName: "ActiveLife Physiotherapy",
        services: [
          {
            name: "Initial Assessment",
            description: "Comprehensive physiotherapy assessment",
            duration: 60,
            price: 150,
            category: "Physiotherapy",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 8
          },
          {
            name: "Follow-up Treatment",
            description: "Physiotherapy follow-up session",
            duration: 45,
            price: 120,
            category: "Physiotherapy",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 12
          },
          {
            name: "Sports Injury Treatment",
            description: "Specialized treatment for sports injuries",
            duration: 60,
            price: 160,
            category: "Sports Physiotherapy",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 6
          },
          {
            name: "Dry Needling",
            description: "Dry needling therapy for trigger points",
            duration: 30,
            price: 80,
            category: "Physiotherapy",
            isActive: true,
            requiresApproval: false,
            maxBookingsPerDay: 10
          }
        ]
      }
    ];

    // Create services for each partner
    for (const group of servicesData) {
      const partner = partners.find(p => p.name === group.partnerName);
      
      if (!partner) {
        console.log(`❌ Partner not found: ${group.partnerName}`);
        continue;
      }

      console.log(`\n📍 Creating services for ${partner.name}...`);

      for (const serviceData of group.services) {
        try {
          const service = await strapi.entityService.create('api::service.service', {
            data: {
              ...serviceData,
              partner: partner.id, // Use the partner's ID to create the relation
              publishedAt: new Date()
            }
          } as any);

          console.log(`✅ Created service: ${service.name}`);
        } catch (error) {
          console.error(`❌ Failed to create service ${serviceData.name}:`, error);
        }
      }
    }

    console.log('\n✨ Manual service fix completed!');
    return true;
  } catch (error) {
    console.error('❌ Error in manual fix:', error);
    return false;
  }
}