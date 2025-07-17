import { factories } from '@strapi/strapi';
import { ApplicationError } from '../../../utils/error-handler';

export default factories.createCoreService('api::commission-calculation.commission-calculation', ({ strapi }) => ({
  async validateCommissionCalculation(orderId: number) {
    // Check if commissions already calculated for this order
    const existingCommissions = await strapi.entityService.findMany('api::commission-calculation.commission-calculation', {
      filters: { order: { id: orderId } }
    });

    if (existingCommissions.length > 0) {
      throw new ApplicationError('Commissions already calculated for this order');
    }

    return true;
  },

  validateCommissionRules(details: any[], itemTotal: number) {
    // Group details by customer type and level
    const grouped = {};
    
    for (const detail of details) {
      const key = `${detail.customerType}_${detail.levelType}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(detail);
    }

    // Check for duplicate rules
    for (const [key, rules] of Object.entries(grouped)) {
      if ((rules as any[]).length > 1) {
        throw new ApplicationError(`Duplicate commission rules found for ${key}`);
      }
    }

    // Validate commission totals don't exceed 100% for percentage-based commissions
    let totalPercentage = 0;
    for (const detail of details) {
      if (detail.commissionType === 'percentage') {
        totalPercentage += detail.commissionValue;
      }
    }

    if (totalPercentage > 100) {
      strapi.log.warn(`Total commission percentage exceeds 100%: ${totalPercentage}%`);
    }

    // Validate fixed commissions don't exceed item total
    let totalFixed = 0;
    for (const detail of details) {
      if (detail.commissionType === 'fixed') {
        totalFixed += detail.commissionValue;
      }
    }

    if (totalFixed > itemTotal) {
      throw new ApplicationError(`Total fixed commissions (${totalFixed}) exceed item total (${itemTotal})`);
    }

    return true;
  },
  async calculateOrderCommissions(orderId: number) {
    try {
      // Validate before calculation
      await this.validateCommissionCalculation(orderId);
      const order = await strapi.entityService.findOne('api::order.order', orderId, {
        populate: {
          user: {
            populate: ['partnerCompany']
          },
          items: {
            populate: {
              product: {
                populate: ['commissionTemplate']
              }
            }
          }
        }
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
        const customerType = (order as any).user.customerType || 'regular';

        // Validate commission rules
        this.validateCommissionRules(activeTemplate.details, itemTotal);

        for (const detail of activeTemplate.details) {
          // Filter by customer type
          if (detail.customerType !== 'all' && detail.customerType !== customerType) {
            continue;
          }

          const beneficiary = this.getBeneficiaryByLevel(beneficiaries, detail, (order as any).user);
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
            calculationStatus: 'pending',
            appliedTemplate: activeTemplate.id
          });
        }
      }

      // Wrap in transaction
      const createdCommissions = await strapi.db.transaction(async () => {
        const results = await Promise.all(
          commissions.map(commission =>
            strapi.entityService.create('api::commission-calculation.commission-calculation', {
              data: commission
            })
          )
        );

        // Check and update achievements after commission calculation
        await this.checkAndUpdateAchievements(orderId, (order as any).user.id);

        return results;
      });

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
        templateStatus: 'active'
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

  async traceBeneficiaries(user: any, maxLevels: number = 10) {
    const beneficiaries = [];
    let currentUser = user;
    let level = 0;

    // Add direct seller
    beneficiaries.push({
      id: currentUser.id,
      level: 0,
      type: 'direct'
    });

    // Add partner company if exists
    if (currentUser.partnerCompany) {
      beneficiaries.push({
        id: currentUser.partnerCompany.id,
        level: -1, // Special level for partner company
        type: 'partner_company',
        isCompany: true
      });
    }

    // Trace upline chain
    while (currentUser.upline && level < maxLevels) {
      level++;
      currentUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        currentUser.upline.id || currentUser.upline,
        {
          populate: ['upline', 'partnerCompany']
        }
      );

      if (currentUser) {
        beneficiaries.push({
          id: currentUser.id,
          level,
          type: `upline_${level}`
        });

        // Check if this upline has a partner company
        if (currentUser.partnerCompany && !beneficiaries.some(b => b.type === 'partner_company')) {
          beneficiaries.push({
            id: currentUser.partnerCompany.id,
            level: -1,
            type: 'partner_company',
            isCompany: true
          });
        }
      }
    }

    return beneficiaries;
  },

  getBeneficiaryByLevel(beneficiaries: any[], detail: any, _user?: any) {
    if (detail.levelType === 'direct') {
      return beneficiaries.find(b => b.level === 0);
    }
    
    if (detail.levelType === 'partner_company') {
      return beneficiaries.find(b => b.type === 'partner_company');
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
        beneficiary: { id: userId },
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
      switch (commission.calculationStatus) {
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

  async approveCommissions(commissionIds: number[], approvedById?: number) {
    const updatedCommissions = await Promise.all(
      commissionIds.map(id =>
        strapi.entityService.update('api::commission-calculation.commission-calculation', id, {
          data: {
            calculationStatus: 'approved',
            approvedAt: new Date(),
            ...((approvedById ? { approvedBy: approvedById } : {}) as any)
          }
        })
      )
    );

    // Log approval action
    strapi.log.info(`User ${approvedById} approved ${commissionIds.length} commissions`);

    return updatedCommissions;
  },

  async markCommissionsAsPaid(commissionIds: number[], paidById?: number) {
    const updatedCommissions = await Promise.all(
      commissionIds.map(id =>
        strapi.entityService.update('api::commission-calculation.commission-calculation', id, {
          data: {
            calculationStatus: 'paid',
            paidAt: new Date(),
            ...((paidById ? { paidBy: paidById } : {}) as any)
          }
        })
      )
    );

    // Log payment action
    strapi.log.info(`User ${paidById} marked ${commissionIds.length} commissions as paid`);

    return updatedCommissions;
  },

  async checkAndUpdateAchievements(_orderId: number, userId: number) {
    try {
      // Get all active achievement rewards
      const activeRewards = await strapi.entityService.findMany('api::achievement-reward.achievement-reward', {
        filters: {
          achievementStatus: 'active'
        }
      });

      // Get user's current achievements
      const userAchievements = await strapi.entityService.findMany('api::user-achievement.user-achievement', {
        filters: {
          user: { id: userId },
          reward: {
            id: { $in: activeRewards.map(r => r.id) }
          }
        },
        populate: ['reward']
      });

      // Calculate user's sales metrics for each achievement period
      for (const reward of activeRewards) {
        let currentAchievement = userAchievements.find((ua: any) => ua.reward?.id === reward.id);
        
        // Create new user achievement if doesn't exist
        if (!currentAchievement) {
          // Calculate period dates based on reward period type
          const { periodStart, periodEnd } = this.calculateAchievementPeriod((reward as any).periodType);
          
          currentAchievement = await strapi.entityService.create('api::user-achievement.user-achievement', {
            data: {
              user: userId,
              reward: reward.id,
              periodStart,
              periodEnd,
              achievedValue: 0,
              rewardStatus: 'in_progress'
            }
          });
        }

        // Calculate total sales for the achievement period
        const totalSales = await this.calculateUserSalesForPeriod(
          userId,
          new Date((currentAchievement as any).periodStart),
          new Date((currentAchievement as any).periodEnd),
          (reward as any).criteriaType
        );

        // Update achievement progress
        const isQualified = totalSales >= (reward as any).criteriaValue;
        const newStatus = isQualified ? 'qualified' : 'in_progress';

        await strapi.entityService.update('api::user-achievement.user-achievement', (currentAchievement as any).id, {
          data: {
            achievedValue: totalSales,
            rewardStatus: newStatus,
            ...(isQualified && (currentAchievement as any).rewardStatus !== 'qualified' ? { claimedAt: new Date() } : {})
          }
        });

        // Log achievement qualification
        if (isQualified && (currentAchievement as any).rewardStatus !== 'qualified') {
          strapi.log.info(`User ${userId} qualified for achievement ${(reward as any).rewardName}`);
        }
      }
    } catch (error) {
      strapi.log.error(`Failed to check achievements for user ${userId}: ${error.message}`);
    }
  },

  async calculateUserSalesForPeriod(userId: number, startDate: Date, endDate: Date, metricType: string) {
    // Get all paid orders for the user in the period
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        user: { id: userId },
        paymentStatus: 'PAID',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });

    if (metricType === 'sales_volume') {
      return orders.reduce((sum, order) => sum + (order.total || 0), 0);
    } else if (metricType === 'units_sold') {
      // Count total units from all orders
      let totalUnits = 0;
      for (const order of orders) {
        const orderWithItems = await strapi.entityService.findOne('api::order.order', order.id, {
          populate: ['items']
        });
        if ((orderWithItems as any)?.items) {
          totalUnits += (orderWithItems as any).items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        }
      }
      return totalUnits;
    }

    return 0;
  },

  calculateAchievementPeriod(periodType: string) {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (periodType) {
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        periodStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        periodEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { periodStart, periodEnd };
  }
}));