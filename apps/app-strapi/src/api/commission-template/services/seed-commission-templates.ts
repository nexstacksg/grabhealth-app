export async function seedCommissionTemplates(strapi: any) {
  try {
    // Check if templates already exist
    const existingTemplates = await strapi.entityService.findMany('api::commission-template.commission-template', {
      limit: 1
    });

    if (existingTemplates.length > 0) {
      strapi.log.info('Commission templates already exist, skipping seed');
      return;
    }

    // Create standard product commission template
    const standardTemplate = await strapi.entityService.create('api::commission-template.commission-template', {
      data: {
        templateName: 'Standard Product Commission',
        templateCode: 'STANDARD-001',
        description: 'Standard commission structure for all products',
        productCommissionStatus: 'active'
      }
    });

    // Create commission template details
    const commissionLevels = [
      { levelType: 'direct', levelNumber: 0, customerType: 'regular', commissionType: 'percentage', commissionValue: 30 },
      { levelType: 'direct', levelNumber: 0, customerType: 'vip', commissionType: 'percentage', commissionValue: 35 },
      { levelType: 'direct', levelNumber: 0, customerType: 'wholesale', commissionType: 'percentage', commissionValue: 25 },
      { levelType: 'upline_1', levelNumber: 1, customerType: 'all', commissionType: 'percentage', commissionValue: 10 },
      { levelType: 'upline_2', levelNumber: 2, customerType: 'all', commissionType: 'percentage', commissionValue: 5 },
      { levelType: 'upline_3', levelNumber: 3, customerType: 'all', commissionType: 'percentage', commissionValue: 3 },
      { levelType: 'upline_4', levelNumber: 4, customerType: 'all', commissionType: 'fixed', commissionValue: 50 },
      { levelType: 'upline_5', levelNumber: 5, customerType: 'all', commissionType: 'fixed', commissionValue: 25 }
    ];

    for (const level of commissionLevels) {
      await strapi.entityService.create('api::commission-template-detail.commission-template-detail', {
        data: {
          ...level,
          template: standardTemplate.id
        }
      });
    }

    // Create premium product commission template
    const premiumTemplate = await strapi.entityService.create('api::commission-template.commission-template', {
      data: {
        templateName: 'Premium Product Commission',
        templateCode: 'PREMIUM-001',
        description: 'Enhanced commission structure for premium products',
        status: 'active'
      }
    });

    // Create premium template details with higher rates
    const premiumLevels = [
      { levelType: 'direct', levelNumber: 0, customerType: 'all', commissionType: 'percentage', commissionValue: 40 },
      { levelType: 'upline_1', levelNumber: 1, customerType: 'all', commissionType: 'percentage', commissionValue: 15 },
      { levelType: 'upline_2', levelNumber: 2, customerType: 'all', commissionType: 'percentage', commissionValue: 8 },
      { levelType: 'upline_3', levelNumber: 3, customerType: 'all', commissionType: 'percentage', commissionValue: 5 }
    ];

    for (const level of premiumLevels) {
      await strapi.entityService.create('api::commission-template-detail.commission-template-detail', {
        data: {
          ...level,
          template: premiumTemplate.id
        }
      });
    }

    // Assign standard template to all existing products
    const products = await strapi.entityService.findMany('api::product.product', {
      filters: {
        commissionTemplate: null
      }
    });

    for (const product of products) {
      await strapi.entityService.update('api::product.product', product.id, {
        data: {
          commissionTemplate: standardTemplate.id
        }
      });
    }

    strapi.log.info(`Commission templates seeded successfully. Assigned to ${products.length} products.`);
  } catch (error) {
    strapi.log.error('Error seeding commission templates:', error);
  }
}

// Export function to be called from bootstrap
export default seedCommissionTemplates;