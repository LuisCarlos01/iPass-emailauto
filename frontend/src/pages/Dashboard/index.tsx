import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardMetrics {
  totalRules: number;
  activeRules: number;
  totalEmails: number;
  processedEmails: number;
  errorEmails: number;
  monitoringStatus: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  emailsByDay: Array<{
    date: string;
    count: number;
  }>;
  ruleDistribution: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B'];

const getMonitoringStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-500';
    case 'INACTIVE':
      return 'text-yellow-500';
    case 'ERROR':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getMonitoringStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Ativo';
    case 'INACTIVE':
      return 'Inativo';
    case 'ERROR':
      return 'Erro';
    default:
      return 'Desconhecido';
  }
};

export function Dashboard() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>(
    'dashboard-metrics',
    async () => {
      const response = await api.get('/dashboard/metrics');
      return response.data;
    },
    {
      refetchInterval: 30000 // Atualiza a cada 30 segundos
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Bem-vindo, {user?.name}!
              </h2>
              <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <SignalIcon className={`mr-1.5 h-5 w-5 flex-shrink-0 ${getMonitoringStatusColor(metrics?.monitoringStatus || 'INACTIVE')}`} />
                  Status do Monitoramento: {getMonitoringStatusText(metrics?.monitoringStatus || 'INACTIVE')}
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total de Regras */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Regras
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metrics?.totalRules || 0}
                        </div>
                        <div className="ml-2">
                          <span className="text-sm text-gray-500">
                            ({metrics?.activeRules || 0} ativas)
                          </span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/email-rules"
                    className="font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Ver todas as regras
                  </Link>
                </div>
              </div>
            </div>

            {/* Emails Processados */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Emails Processados
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metrics?.processedEmails || 0}
                        </div>
                        <div className="ml-2">
                          <span className="text-sm text-gray-500">
                            de {metrics?.totalEmails || 0}
                          </span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/email-logs"
                    className="font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Ver logs de email
                  </Link>
                </div>
              </div>
            </div>

            {/* Taxa de Sucesso */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Taxa de Sucesso
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metrics?.totalEmails
                            ? Math.round(
                                (metrics.processedEmails / metrics.totalEmails) * 100
                              )
                            : 0}
                          %
                        </div>
                        <div className="ml-2">
                          <span
                            className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              metrics?.errorEmails ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {metrics?.errorEmails
                              ? `${metrics.errorEmails} erros`
                              : 'Sem erros'}
                          </span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/settings"
                    className="font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Configurar sistema
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Gráfico de Área - Emails por Dia */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Emails por Dia
                </h3>
                <div className="mt-2 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metrics?.emailsByDay || []}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráfico de Pizza - Distribuição de Regras */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Distribuição de Regras
                </h3>
                <div className="mt-2 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics?.ruleDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                          name,
                        }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {(metrics?.ruleDistribution || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 