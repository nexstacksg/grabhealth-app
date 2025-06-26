import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log(
      '🚀 Setting up public permissions for categories and products...'
    );

    try {
      // Get the public role
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({
          where: { type: 'public' },
        });

      if (!publicRole) {
        console.error('❌ Public role not found');
        return;
      }

      // Define the permissions we want to grant to public users
      const publicPermissions = [
        // Category permissions
        {
          action: 'api::category.category.find',
          subject: null,
        },
        {
          action: 'api::category.category.findOne',
          subject: null,
        },
        // Product permissions
        {
          action: 'api::product.product.find',
          subject: null,
        },
        {
          action: 'api::product.product.findOne',
          subject: null,
        },
        // Partner permissions
        {
          action: 'api::partner.partner.find',
          subject: null,
        },
        {
          action: 'api::partner.partner.findOne',
          subject: null,
        },
        {
          action: 'api::partner.partner.getServices',
          subject: null,
        },
        {
          action: 'api::partner.partner.getAvailableSlots',
          subject: null,
        },
        // Service permissions
        {
          action: 'api::service.service.find',
          subject: null,
        },
        {
          action: 'api::service.service.findOne',
          subject: null,
        },
      ];

      // Grant permissions to public role
      for (const permission of publicPermissions) {
        const existingPermission = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({
            where: {
              action: permission.action,
              role: publicRole.id,
            },
          });

        if (!existingPermission) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: permission.action,
              subject: permission.subject,
              role: publicRole.id,
              conditions: [],
            },
          });
          console.log(`✅ Granted permission: ${permission.action}`);
        } else {
          console.log(`ℹ️  Permission already exists: ${permission.action}`);
        }
      }

      console.log('✅ Public permissions setup completed');

      // Check existing partners and services
      const existingPartners = await strapi.entityService.findMany(
        'api::partner.partner',
        {} as any
      );

      const existingServices = await strapi.entityService.findMany(
        'api::service.service',
        {} as any
      );

      // Seed partners if none exist
      if (!existingPartners || existingPartners.length === 0) {
        console.log('🌱 Seeding sample partners...');

        const samplePartners = [
          {
            name: 'HealthCare Plus Clinic',
            description:
              'Comprehensive healthcare services with experienced doctors and modern facilities.',
            address: '123 Orchard Road',
            city: 'Singapore',
            state: 'Central',
            country: 'Singapore',
            postalCode: '238858',
            phone: '+65 6123 4567',
            email: 'info@healthcareplus.sg',
            website: 'https://healthcareplus.sg',
            imageUrl: '/uploads/clinic1.jpg',
            rating: 4.5,
            totalReviews: 128,
            isActive: true,
            operatingHours: JSON.stringify({
              monday: { open: '09:00', close: '18:00' },
              tuesday: { open: '09:00', close: '18:00' },
              wednesday: { open: '09:00', close: '18:00' },
              thursday: { open: '09:00', close: '18:00' },
              friday: { open: '09:00', close: '18:00' },
              saturday: { open: '09:00', close: '13:00' },
              sunday: { open: 'closed', close: 'closed' },
            }),
            specializations: JSON.stringify([
              'General Medicine',
              'Cardiology',
              'Dermatology',
            ]),
          },
          {
            name: 'Wellness Medical Center',
            description:
              'Specialized in preventive care and wellness programs.',
            address: '456 Marina Bay',
            city: 'Singapore',
            state: 'Central',
            country: 'Singapore',
            postalCode: '018956',
            phone: '+65 6234 5678',
            email: 'contact@wellness.sg',
            website: 'https://wellness.sg',
            imageUrl: '/uploads/clinic2.jpg',
            rating: 4.2,
            totalReviews: 89,
            isActive: true,
            operatingHours: JSON.stringify({
              monday: { open: '08:00', close: '20:00' },
              tuesday: { open: '08:00', close: '20:00' },
              wednesday: { open: '08:00', close: '20:00' },
              thursday: { open: '08:00', close: '20:00' },
              friday: { open: '08:00', close: '20:00' },
              saturday: { open: '08:00', close: '16:00' },
              sunday: { open: '10:00', close: '16:00' },
            }),
            specializations: JSON.stringify([
              'Preventive Care',
              'Nutrition',
              'Mental Health',
            ]),
          },
        ];

        for (const partnerData of samplePartners) {
          const partner = (await strapi.entityService.create(
            'api::partner.partner',
            {
              data: partnerData,
            } as any
          )) as any;
          console.log(`✅ Created partner: ${partner.name}`);

          // Create comprehensive sample services for each partner
          const sampleServices = [
            {
              name: 'General Health Checkup',
              description:
                'Comprehensive health screening including vital signs, basic physical examination, and health consultation',
              duration: 60,
              price: 150.0,
              category: 'Body Check',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 8,
              partner: partner.id,
            },
            {
              name: 'Blood Test Package',
              description:
                'Complete blood count, lipid profile, liver function, kidney function, and diabetes screening',
              duration: 30,
              price: 120.0,
              category: 'Screening',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 12,
              partner: partner.id,
            },
            {
              name: 'Cardiology Consultation',
              description:
                'Heart health assessment with ECG and blood pressure monitoring',
              duration: 45,
              price: 200.0,
              category: 'Consultation',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 6,
              partner: partner.id,
            },
            {
              name: 'Dermatology Consultation',
              description: 'Skin health examination and treatment consultation',
              duration: 30,
              price: 180.0,
              category: 'Consultation',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 10,
              partner: partner.id,
            },
            {
              name: 'Vaccination Service',
              description:
                'Adult vaccinations including flu shot, hepatitis, and travel vaccines',
              duration: 15,
              price: 50.0,
              category: 'Preventive Care',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 20,
              partner: partner.id,
            },
            {
              name: 'Mental Health Consultation',
              description: 'Psychological assessment and counseling session',
              duration: 60,
              price: 250.0,
              category: 'Mental Health',
              isActive: true,
              requiresApproval: true,
              maxBookingsPerDay: 4,
              partner: partner.id,
            },
            {
              name: 'X-Ray Imaging',
              description: 'Digital X-ray imaging for chest, bones, and joints',
              duration: 20,
              price: 100.0,
              category: 'Imaging',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 15,
              partner: partner.id,
            },
            {
              name: 'Ultrasound Scan',
              description:
                'Abdominal, pelvic, or pregnancy ultrasound examination',
              duration: 30,
              price: 150.0,
              category: 'Imaging',
              isActive: true,
              requiresApproval: false,
              maxBookingsPerDay: 8,
              partner: partner.id,
            },
          ];

          for (const serviceData of sampleServices) {
            const service = (await strapi.entityService.create(
              'api::service.service',
              {
                data: {
                  ...serviceData,
                  publishedAt: new Date(),
                },
              } as any
            )) as any;
            console.log(
              `✅ Created service: ${service.name} for ${partner.name}`
            );
          }
        }

        console.log('✅ Sample partners seeded successfully');
      } else {
        console.log('ℹ️  Partners already exist, checking services...');

        // Check if existing partners have published services, if not, add them
        const publishedServices = existingServices.filter(
          (service) => service.publishedAt
        );
        if (!publishedServices || publishedServices.length === 0) {
          console.log('🌱 Adding services to existing partners...');

          for (const partner of existingPartners) {
            // Create the same comprehensive services for existing partners
            const sampleServices = [
              {
                name: 'General Health Checkup',
                description:
                  'Comprehensive health screening including vital signs, basic physical examination, and health consultation',
                duration: 60,
                price: 150.0,
                category: 'Body Check',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 8,
                partner: partner.id,
              },
              {
                name: 'Blood Test Package',
                description:
                  'Complete blood count, lipid profile, liver function, kidney function, and diabetes screening',
                duration: 30,
                price: 120.0,
                category: 'Screening',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 12,
                partner: partner.id,
              },
              {
                name: 'Cardiology Consultation',
                description:
                  'Heart health assessment with ECG and blood pressure monitoring',
                duration: 45,
                price: 200.0,
                category: 'Consultation',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 6,
                partner: partner.id,
              },
              {
                name: 'Dermatology Consultation',
                description:
                  'Skin health examination and treatment consultation',
                duration: 30,
                price: 180.0,
                category: 'Consultation',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 10,
                partner: partner.id,
              },
              {
                name: 'Vaccination Service',
                description:
                  'Adult vaccinations including flu shot, hepatitis, and travel vaccines',
                duration: 15,
                price: 50.0,
                category: 'Preventive Care',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 20,
                partner: partner.id,
              },
              {
                name: 'Mental Health Consultation',
                description: 'Psychological assessment and counseling session',
                duration: 60,
                price: 250.0,
                category: 'Mental Health',
                isActive: true,
                requiresApproval: true,
                maxBookingsPerDay: 4,
                partner: partner.id,
              },
              {
                name: 'X-Ray Imaging',
                description:
                  'Digital X-ray imaging for chest, bones, and joints',
                duration: 20,
                price: 100.0,
                category: 'Imaging',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 15,
                partner: partner.id,
              },
              {
                name: 'Ultrasound Scan',
                description:
                  'Abdominal, pelvic, or pregnancy ultrasound examination',
                duration: 30,
                price: 150.0,
                category: 'Imaging',
                isActive: true,
                requiresApproval: false,
                maxBookingsPerDay: 8,
                partner: partner.id,
              },
            ];

            for (const serviceData of sampleServices) {
              try {
                const service = (await strapi.entityService.create(
                  'api::service.service',
                  {
                    data: serviceData,
                  } as any
                )) as any;

                // Publish the service after creation
                await strapi.entityService.update(
                  'api::service.service',
                  service.id,
                  {
                    data: {
                      publishedAt: new Date(),
                    },
                  } as any
                );

                console.log(
                  `✅ Created and published service: ${service.name} for ${partner.name}`
                );
              } catch (error) {
                console.error(
                  `❌ Failed to create service ${serviceData.name}:`,
                  error
                );
              }
            }
          }

          console.log('✅ Services added to existing partners successfully');
        } else {
          console.log('ℹ️  Services already exist, skipping service seeding');
        }
      }
    } catch (error) {
      console.error('❌ Error setting up public permissions:', error);
    }
  },
};
