import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface EmailLog {
  id: string;
  fromEmail: string;
  subject: string | null;
  status: string;
  error: string | null;
  createdAt: string;
  emailRule: {
    name: string;
    fromEmail: string;
  };
}

interface MonitoringStatusData {
  isActive: boolean;
  recentLogs: EmailLog[];
}

export function MonitoringStatus() {
  const [status, setStatus] = useState<MonitoringStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const response = await api.get<MonitoringStatusData>('/monitoring/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  }

  async function handleStartMonitoring() {
    setIsStarting(true);
    try {
      await api.post('/monitoring/start');
      toast.success('Monitoramento iniciado com sucesso!');
      await loadStatus();
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error);
      toast.error('Erro ao iniciar monitoramento. Verifique as configurações.');
    } finally {
      setIsStarting(false);
    }
  }

  async function handleStopMonitoring() {
    setIsStopping(true);
    try {
      await api.post('/monitoring/stop');
      toast.success('Monitoramento parado com sucesso!');
      await loadStatus();
    } catch (error) {
      console.error('Erro ao parar monitoramento:', error);
      toast.error('Erro ao parar monitoramento.');
    } finally {
      setIsStopping(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('pt-BR');
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Status do Monitoramento</h2>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {status?.isActive ? 'Ativo' : 'Inativo'}
            </span>
            <button
              onClick={status?.isActive ? handleStopMonitoring : handleStartMonitoring}
              disabled={isStarting || isStopping}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                status?.isActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {isStarting ? 'Iniciando...' :
               isStopping ? 'Parando...' :
               status?.isActive ? 'Parar Monitoramento' : 'Iniciar Monitoramento'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Logs Recentes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remetente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {status?.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.fromEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.subject || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.emailRule?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'PROCESSED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                      {log.error && (
                        <span className="ml-2 text-xs text-red-600" title={log.error}>
                          ⚠️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!status?.recentLogs || status.recentLogs.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum log encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 