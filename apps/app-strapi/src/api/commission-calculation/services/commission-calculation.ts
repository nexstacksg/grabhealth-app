import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

export default factories.createCoreService('api::commission-calculation.commission-calculation', ({ strapi }) => ({
  async calculateOrderCommissions(orderId: number) {
    try {
      const order = await strapi.entityService.findOne('api::order.order', orderId, {
        populate: ['user', 'items', 'items.product', 'items.product.commissionTemplate']
      });

      if (!order) {
        throw new ApplicationError('Order not found');
      }

      const commissions = [];
      
      const orderItems = (order as any).items || [];
      for (const item of orderItems) {
        const product = item.product;
        if (!product.commissionTemplate) {
          continue;
        }

        const template = await strapi.entityService.findOne(
          'api::commission-template.commission-template',
          product.commissionTemplate.id,
          {
            populate: ['details']
          }
        );

        if (!template || template.productCommissionStatus !== 'active') {
          continue;
        }

        const timeBasedTemplate = await this.getActiveTimeBasedTemplate(product.id, new Date());
        const activeTemplate = timeBasedTemplate || template;

        const itemTotal = item.price * item.quantity;
        const beneficiaries = await this.traceBeneficiaries((order as any).user);

        for (const detail of activeTemplate.details) {
          const beneficiary = this.getBeneficiaryByLevel(beneficiaries, detail);
          if (!beneficiary) continue;

          const amount = this.calculateCommissionAmount(itemTotal, detail);
          
          commissions.push({
            order: orderId,
            beneficiary: beneficiary.id,
            beneficiaryType: detail.levelType === 'partner_company' ? 'company' : 'user',
            commissionLevel: detail.levelNumber || 0,
            commissionType: detail.commissionType,
            commissionRate: detail.commissionValue,
            commissionAmount: amount,
            status: 'pending',
            appliedTemplate: activeTemplate.id
          });
        }
      }

      const createdCommissions = await Promise.all(
        commissions.map(commission =>
          strapi.entityService.create('api::commission-calculation.commission-calculation', {
            data: commission
          })
        )
      );

      return createdCommissions;
    } catch (error) {
      throw new ApplicationError(`Failed to calculate commissions: ${error.message}`);
    }
  },

  async getActiveTimeBasedTemplate(productId: number, date: Date) {
    const templates = await strapi.entityService.findMany('api::time-based-template.time-based-template', {
      filters: {
        product: { id: productId },
        startDate: { $lte: date },
        endDate: { $gte: date },
        status: 'active'
      },
      populate: {
        commissionTemplate: {
          populate: ['details']
        }
      },
      sort: { priority: 'desc' },
      limit: 1
    });

    return templates[0] ? (templates[0] as any).commissionTemplate : null;
  },

  async traceBeneficiaries(user: any) {
    const beneficiaries = [];
    let currentUser = user;
    let level = 0;

    beneficiaries.push({
      id: currentUser.id,
      level: 0,
      type: 'direct'
    });

    while (currentUser.upline && level < 5) {
      level++;
      currentUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        currentUser.upline.id || currentUser.upline,
        {
          populate: ['upline']
        }
      );

      if (currentUser) {
        beneficiaries.push({
          id: currentUser.id,
          level,
          type: `upline_${level}`
        });
      }
    }

    return beneficiaries;
  },

  getBeneficiaryByLevel(beneficiaries: any[], detail: any) {
    if (detail.levelType === 'direct') {
      return beneficiaries.find(b => b.level === 0);
    }
    
    if (detail.levelType.startsWith('upline_')) {
      const level = parseInt(detail.levelType.split('_')[1]);
      return beneficiaries.find(b => b.level === level);
    }

    return null;
  },

  calculateCommissionAmount(baseAmount: number, detail: any) {
    if (detail.commissionType === 'percentage') {
      return (baseAmount * detail.commissionValue) / 100;
    } else {
      return detail.commissionValue;
    }
  },

  async getUserCommissionSummary(userId: number, filters: any = {}) {
    const commissions = await strapi.entityService.findMany('api::commission-calculation.commission-calculation', {
      filters: {
        beneficiary: userId,
        ...filters
      },
      populate: {
        order: {
          populate: ['user']
        },
        appliedTemplate: true
      }
    });

    const summary = {
      totalPending: 0,
      totalApproved: 0,
      totalPaid: 0,
      commissions: []
    };

    for (const commission of commissions) {
      switch (commission.status) {
        case 'pending':
          summary.totalPending += parseFloat(String(commission.commissionAmount));
          break;
        case 'approved':
          summary.totalApproved += parseFloat(String(commission.commissionAmount));
          break;
        case 'paid':
          summary.totalPaid += parseFloat(String(commission.commissionAmount));
          break;
      }
      summary.commissions.push(commission);
    }

    return summary;
  },

  async approveCommissions(commissionIds: number[]) {
    const updatedCommissions = await Promise.all(
      commissionIds.map(id =>
        strapi.entityService.update('api::commission-calculation.commission-calculation', id, {
          data: {
            status: 'approved'
          }
        })
      )
    );

    return updatedCommissions;
  },

  async markCommissionsAsPaid(commissionIds: number[]) {
    const updatedCommissions = await Promise.all(
      commissionIds.map(id =>
        strapi.entityService.update('api::commission-calculation.commission-calculation', id, {
          data: {
            status: 'paid',
            paidAt: new Date()
          }
        })
      )
    );

    return updatedCommissions;
  }
}));