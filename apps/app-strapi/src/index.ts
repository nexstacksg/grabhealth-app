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
        // Service permissions
        {
          action: 'api::service.service.find',
          subject: null,
        },
        {
          action: 'api::service.service.findOne',
          subject: null,
        },
        // Partner availability permissions
        {
          action: 'api::partner-availability.partner-availability.find',
          subject: null,
        },
        {
          action: 'api::partner-availability.partner-availability.findOne',
          subject: null,
        },
        // Partner days off permissions
        {
          action: 'api::partner-days-off.partner-days-off.find',
          subject: null,
        },
        {
          action: 'api::partner-days-off.partner-days-off.findOne',
          subject: null,
        },
        // Commission structure permissions (read-only)
        {
          action: 'api::commission-tier.commission-tier.find',
          subject: null,
        },
        {
          action: 'api::commission-tier.commission-tier.findOne',
          subject: null,
        },
        {
          action: 'api::product-commission-tier.product-commission-tier.find',
          subject: null,
        },
        {
          action: 'api::product-commission-tier.product-commission-tier.findOne',
          subject: null,
        },
        {
          action: 'api::volume-bonus-tier.volume-bonus-tier.find',
          subject: null,
        },
        {
          action: 'api::volume-bonus-tier.volume-bonus-tier.findOne',
          subject: null,
        },
        {
          action: 'api::gift-item.gift-item.find',
          subject: null,
        },
        {
          action: 'api::gift-item.gift-item.findOne',
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

      // Setup authenticated user permissions for bookings
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({
          where: { type: 'authenticated' },
        });

      if (authenticatedRole) {
        const authPermissions = [
          {
            action: 'api::booking.booking.find',
            subject: null,
          },
          {
            action: 'api::booking.booking.findOne',
            subject: null,
          },
          {
            action: 'api::booking.booking.create',
            subject: null,
          },
          {
            action: 'api::booking.booking.update',
            subject: null,
          },
        ];

        for (const permission of authPermissions) {
          const existingPermission = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action: permission.action,
                role: authenticatedRole.id,
              },
            });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: permission.action,
                subject: permission.subject,
                role: authenticatedRole.id,
                conditions: [],
              },
            });
            console.log(`✅ Granted authenticated permission: ${permission.action}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error setting up public permissions:', error);
    }

    // Seed data in development
    if (process.env.NODE_ENV === 'development') {
      // Seed products and categories
      const seedProducts = await import('./seed/seed-products');
      console.log('\n🌱 Running product seed in development mode...');
      await seedProducts.default(strapi);

      // Seed partners
      const seedPartners = await import('./seed/seed-partners');
      console.log('\n🌱 Running partner seed in development mode...');
      await seedPartners.default(strapi);

      // Manual fix for services
      const manualFix = await import('./seed/manual-fix-services');
      console.log('\n🔧 Running manual service fix...');
      await manualFix.default(strapi);
    }
  },
};
