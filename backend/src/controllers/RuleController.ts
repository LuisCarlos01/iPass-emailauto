import { Request, Response } from 'express';
import RuleService from '../services/RuleService';
import { z } from 'zod';

const createRuleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  conditions: z.array(z.object({
    field: z.enum(['from', 'to', 'subject', 'body']),
    operator: z.enum(['contains', 'equals', 'startsWith', 'endsWith', 'matches']),
    value: z.string().min(1)
  })).min(1),
  actions: z.array(z.object({
    type: z.enum(['reply', 'forward', 'archive', 'label']),
    template: z.string().optional(),
    to: z.string().email().optional(),
    label: z.string().optional()
  })).min(1)
});

const updateRuleSchema = createRuleSchema.partial().extend({
  id: z.string().uuid()
});

class RuleController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = createRuleSchema.parse(req.body);
      const rule = await RuleService.create({
        ...validatedData,
        userId
      });

      return res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating rule:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = updateRuleSchema.parse(req.body);
      
      // Verifica se a regra pertence ao usuário
      const existingRule = await RuleService.findById(validatedData.id);
      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const rule = await RuleService.update(validatedData);
      return res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating rule:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      
      // Verifica se a regra pertence ao usuário
      const existingRule = await RuleService.findById(id);
      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      await RuleService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting rule:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const rule = await RuleService.findById(id);
      
      if (!rule || rule.userId !== userId) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      return res.json(rule);
    } catch (error) {
      console.error('Error finding rule:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findByUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const rules = await RuleService.findByUser(userId);
      return res.json(rules);
    } catch (error) {
      console.error('Error finding rules:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async toggleActive(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      
      // Verifica se a regra pertence ao usuário
      const existingRule = await RuleService.findById(id);
      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const rule = await RuleService.toggleActive(id);
      return res.json(rule);
    } catch (error) {
      console.error('Error toggling rule:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePriority(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const { priority } = req.body;

      if (typeof priority !== 'number' || priority < 0) {
        return res.status(400).json({ error: 'Invalid priority value' });
      }

      // Verifica se a regra pertence ao usuário
      const existingRule = await RuleService.findById(id);
      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const rule = await RuleService.updatePriority(id, priority);
      return res.json(rule);
    } catch (error) {
      console.error('Error updating rule priority:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new RuleController(); 