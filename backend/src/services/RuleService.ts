import { PrismaClient, Rule, Condition, Action } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateRuleDTO {
  name: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  userId: string;
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  actions: {
    type: string;
    template?: string;
    to?: string;
    label?: string;
  }[];
}

interface UpdateRuleDTO extends Partial<CreateRuleDTO> {
  id: string;
}

class RuleService {
  async create(data: CreateRuleDTO): Promise<Rule> {
    return prisma.rule.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
        userId: data.userId,
        conditions: {
          create: data.conditions
        },
        actions: {
          create: data.actions
        }
      },
      include: {
        conditions: true,
        actions: true
      }
    });
  }

  async update(data: UpdateRuleDTO): Promise<Rule> {
    const { id, conditions, actions, ...ruleData } = data;

    // Atualiza a regra principal
    const rule = await prisma.rule.update({
      where: { id },
      data: ruleData,
      include: {
        conditions: true,
        actions: true
      }
    });

    // Se houver novas condições, atualiza
    if (conditions) {
      await prisma.condition.deleteMany({
        where: { ruleId: id }
      });
      await prisma.condition.createMany({
        data: conditions.map(c => ({ ...c, ruleId: id }))
      });
    }

    // Se houver novas ações, atualiza
    if (actions) {
      await prisma.action.deleteMany({
        where: { ruleId: id }
      });
      await prisma.action.createMany({
        data: actions.map(a => ({ ...a, ruleId: id }))
      });
    }

    return rule;
  }

  async delete(id: string): Promise<void> {
    await prisma.rule.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<Rule | null> {
    return prisma.rule.findUnique({
      where: { id },
      include: {
        conditions: true,
        actions: true
      }
    });
  }

  async findByUser(userId: string): Promise<Rule[]> {
    return prisma.rule.findMany({
      where: { userId },
      include: {
        conditions: true,
        actions: true
      },
      orderBy: {
        priority: 'desc'
      }
    });
  }

  async toggleActive(id: string): Promise<Rule> {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule) throw new Error('Rule not found');

    return prisma.rule.update({
      where: { id },
      data: { isActive: !rule.isActive },
      include: {
        conditions: true,
        actions: true
      }
    });
  }

  async updatePriority(id: string, priority: number): Promise<Rule> {
    return prisma.rule.update({
      where: { id },
      data: { priority },
      include: {
        conditions: true,
        actions: true
      }
    });
  }
}

export default new RuleService(); 