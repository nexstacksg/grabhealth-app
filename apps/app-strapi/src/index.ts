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
    } catch (error) {
      console.error('❌ Error setting up public permissions:', error);
    }
  },
};
