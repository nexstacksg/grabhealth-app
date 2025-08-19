// import type { Core } from '@strapi/strapi';

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
  async bootstrap({ strapi }) {
    // Ensure email confirmation is disabled since we're using custom flow
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    await pluginStore.set({
      key: 'advanced',
      value: {
        unique_email: true,
        allow_register: true,
        email_confirmation: false, // We handle this ourselves
        email_reset_password: null,
        email_confirmation_redirection: null,
        default_role: 'authenticated',
      },
    });

    // Seed commission templates
    // try {
    //   const seedCommissionTemplates = (await import('./api/commission-template/services/seed-commission-templates')).default;
    //   await seedCommissionTemplates(strapi);
    // } catch (error) {
    //   strapi.log.warn('Commission template seeding skipped:', error.message);
    // }

    // Seed product variants
    // try {
    //   const seedProductVariants = (await import('./api/product-variant/services/seed-product-variants')).default;
    //   await seedProductVariants({ strapi });
    // } catch (error) {
    //   strapi.log.warn('Product variant seeding skipped:', error.message);
    // }
  },
};
