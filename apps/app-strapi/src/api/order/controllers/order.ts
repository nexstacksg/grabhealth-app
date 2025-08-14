/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

interface OrderWithRelations {
  id: number;
  documentId: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  user?: {
    email: string;
    username?: string;
  };
  items?: Array<{
    quantity: number;
    price: number;
    product?: {
      name: string;
      description?: string;
    };
  }>;
}

export default factories.createCoreController('api::order.order', ({ strapi }: { strapi: Core.Strapi }) => ({
  async sendOrderConfirmationEmail(ctx) {
    const { id } = ctx.params;
    try {
      // Fetch order with relations
      const order = await strapi.db.query('api::order.order').findOne({
        where: { documentId: id },
        populate: {
          user: true,
          items: {
            populate: {
              product: true,
            },
          },
        },
      }) as OrderWithRelations;

      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.user?.email) {
        throw new Error('No email address found for order');
      }

      // Generate order items HTML
      const orderItemsHtml = order.items?.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product?.name || 'Product'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `).join('') || '';

      // Create email content with invoice style
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Receipt - GrabHealth</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 700px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #333; margin: 0; font-size: 32px;">PAYMENT RECEIPT</h1>
              <p style="color: #666; margin-top: 10px; font-size: 18px;">Thank you for your payment</p>
            </div>
            
            <!-- Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
              <div style="flex: 1;">
                <h3 style="color: #333; margin-bottom: 10px; font-size: 16px;">INVOICE TO:</h3>
                <p style="margin: 5px 0; color: #666;">${order.user.username || 'Customer'}</p>
                <p style="margin: 5px 0; color: #666;">${order.user.email}</p>
              </div>
              <div style="text-align: right;">
                <table style="margin-left: auto;">
                  <tr>
                    <td style="padding: 5px 10px; text-align: right; color: #666;">Invoice No:</td>
                    <td style="padding: 5px 10px; font-weight: bold; color: #333;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; text-align: right; color: #666;">Invoice Date:</td>
                    <td style="padding: 5px 10px; color: #333;">${new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; text-align: right; color: #666;">Payment Status:</td>
                    <td style="padding: 5px 10px; color: #28a745; font-weight: bold;">PAID</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; text-align: right; color: #666;">Payment Method:</td>
                    <td style="padding: 5px 10px; color: #333;">${order.paymentMethod?.toUpperCase() || 'HITPAY'}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 12px; text-align: left; color: #495057; font-weight: 600;">DESCRIPTION</th>
                  <th style="padding: 12px; text-align: center; color: #495057; font-weight: 600;">QTY</th>
                  <th style="padding: 12px; text-align: right; color: #495057; font-weight: 600;">UNIT PRICE</th>
                  <th style="padding: 12px; text-align: right; color: #495057; font-weight: 600;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
            
            <!-- Totals Section -->
            <div style="margin-left: auto; max-width: 300px; margin-bottom: 40px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px; text-align: right; color: #666;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right; color: #333;">$${(order.subtotal || order.total).toFixed(2)}</td>
                </tr>
                ${order.discount && order.discount > 0 ? `
                <tr>
                  <td style="padding: 8px; text-align: right; color: #666;">Discount:</td>
                  <td style="padding: 8px; text-align: right; color: #dc3545;">-$${order.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${order.tax && order.tax > 0 ? `
                <tr>
                  <td style="padding: 8px; text-align: right; color: #666;">Tax:</td>
                  <td style="padding: 8px; text-align: right; color: #333;">$${order.tax.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #dee2e6;">
                  <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #333;">TOTAL PAID:</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #28a745;">$${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 2px solid #dee2e6; padding-top: 30px; margin-top: 40px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: #666; font-size: 16px; margin-bottom: 10px;">This is an automatically generated receipt for your payment.</p>
                <p style="color: #666; font-size: 14px;">Please keep this receipt for your records.</p>
              </div>
              
              <div style="text-align: center; color: #999; font-size: 12px;">
                <p style="margin: 5px 0;">GrabHealth Pte Ltd</p>
                <p style="margin: 5px 0;">support@grabhealth.com | www.grabhealth.com</p>
                <p style="margin: 10px 0 0 0;">© 2024 GrabHealth. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      await strapi.plugins.email.services.email.send({
        to: order.user.email,
        from: strapi.config.get('plugin.email.settings.defaultFrom'),
        subject: `Payment Receipt - Invoice #${order.orderNumber}`,
        html: emailHtml,
      });

      ctx.body = { success: true, message: 'Confirmation email sent successfully' };
    } catch (error) {
      strapi.log.error('Error sending order confirmation email:', error);
      ctx.badRequest(error.message || 'Failed to send confirmation email');
    }
  },
}));