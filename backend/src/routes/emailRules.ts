import { FastifyInstance } from 'fastify';

export default async function emailRulesRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    // TODO: Implementar listagem de regras
    return { message: 'List email rules' };
  });

  app.post('/', async (request, reply) => {
    // TODO: Implementar criação de regra
    return { message: 'Create email rule' };
  });

  app.put('/:id', async (request, reply) => {
    // TODO: Implementar atualização de regra
    return { message: 'Update email rule' };
  });

  app.delete('/:id', async (request, reply) => {
    // TODO: Implementar remoção de regra
    return { message: 'Delete email rule' };
  });
} 