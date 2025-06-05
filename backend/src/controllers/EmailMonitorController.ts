import { Request, Response } from 'express';
import EmailMonitorService from '../services/EmailMonitorService';

class EmailMonitorController {
  async startMonitoring(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await EmailMonitorService.startMonitoring(userId, accessToken);
      return res.json({ message: 'Email monitoring started' });
    } catch (error) {
      console.error('Error starting email monitoring:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async stopMonitoring(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      EmailMonitorService.stopMonitoring(userId);
      return res.json({ message: 'Email monitoring stopped' });
    } catch (error) {
      console.error('Error stopping email monitoring:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isMonitoring = EmailMonitorService.isMonitoring(userId);
      return res.json({ isMonitoring });
    } catch (error) {
      console.error('Error getting monitoring status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EmailMonitorController(); 