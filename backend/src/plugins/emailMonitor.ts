import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { emailMonitorService } from '../services/emailMonitor';

async function emailMonitorPlugin(fastify: FastifyInstance) {
  let isMonitoring = false;

  // Decorator para adicionar o estado do monitoramento ao fastify
  fastify.decorate('emailMonitor', {
    isMonitoring: () => isMonitoring,
    setMonitoring: (state: boolean) => {
      isMonitoring = state;
    }
  });

  fastify.addHook('onReady', async () => {
    try {
      await emailMonitorService.startMonitoring();
      fastify.log.info('Serviço de monitoramento de e-mails iniciado');
    } catch (error) {
      fastify.log.error(
        'Erro ao iniciar serviço de monitoramento de e-mails:',
        error,
      );
    }
  });

  fastify.addHook('onClose', async () => {
    try {
      await emailMonitorService.stopMonitoring();
      fastify.log.info('Serviço de monitoramento de e-mails parado');
    } catch (error) {
      fastify.log.error(
        'Erro ao parar serviço de monitoramento de e-mails:',
        error,
      );
    }
  });
}

export default fp(emailMonitorPlugin, {
  name: 'email-monitor'
}); 