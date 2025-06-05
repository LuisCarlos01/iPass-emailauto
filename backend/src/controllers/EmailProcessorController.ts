import { Request, Response } from 'express';
import EmailProcessorService from '../services/EmailProcessorService';
import { z } from 'zod';

const emailSchema = z.object({
  messageId: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  body: z.string()
});

class EmailProcessorController {
  async processEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = emailSchema.parse(req.body);
      
      await EmailProcessorService.processEmail({
        ...validatedData,
        userId
      }, accessToken);

      return res.status(200).json({ message: 'Email processed successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error processing email:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEmailLogs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const logs = await EmailProcessorService.getEmailLogs(userId);
      return res.json(logs);
    } catch (error) {
      console.error('Error getting email logs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EmailProcessorController(); 