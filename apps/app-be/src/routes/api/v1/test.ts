import { Router, Request, Response } from 'express';
import { sendTestEmail } from '../../../utils/email';

const router = Router();

router.post(
  '/send-test-email',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email address is required',
        });
        return;
      }

      await sendTestEmail(email);

      res.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
