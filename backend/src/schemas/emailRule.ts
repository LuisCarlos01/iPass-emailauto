import { z } from 'zod';

export const createEmailRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fromEmail: z.string().min(1, 'E-mail do remetente é obrigatório'),
  subject: z.string().optional(),
  body: z.string().optional(),
  response: z.string().min(1, 'Resposta automática é obrigatória'),
  isActive: z.boolean(),
});

export const updateEmailRuleSchema = createEmailRuleSchema; 