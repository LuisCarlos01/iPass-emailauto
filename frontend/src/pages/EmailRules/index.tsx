import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

interface EmailRule {
  id: string;
  name: string;
  fromEmail: string;
  subject?: string;
  body?: string;
  response: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailRuleFormData {
  name: string;
  fromEmail: string;
  subject?: string;
  body?: string;
  response: string;
}

export function EmailRules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EmailRule | null>(null);
  const [formData, setFormData] = useState<EmailRuleFormData>({
    name: '',
    fromEmail: '',
    subject: '',
    body: '',
    response: ''
  });

  const queryClient = useQueryClient();

  // Buscar regras
  const { data: rules, isLoading } = useQuery<EmailRule[]>('email-rules', async () => {
    const response = await api.get('/email-rules');
    return response.data;
  });

  // Criar regra
  const createMutation = useMutation(
    async (data: EmailRuleFormData) => {
      const response = await api.post('/email-rules', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('email-rules');
        toast.success('Regra criada com sucesso!');
        setIsModalOpen(false);
        resetForm();
      },
      onError: () => {
        toast.error('Erro ao criar regra. Tente novamente.');
      }
    }
  );

  // Atualizar regra
  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: EmailRuleFormData }) => {
      const response = await api.put(`/email-rules/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('email-rules');
        toast.success('Regra atualizada com sucesso!');
        setIsModalOpen(false);
        resetForm();
      },
      onError: () => {
        toast.error('Erro ao atualizar regra. Tente novamente.');
      }
    }
  );

  // Excluir regra
  const deleteMutation = useMutation(
    async (id: string) => {
      await api.delete(`/email-rules/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('email-rules');
        toast.success('Regra excluída com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao excluir regra. Tente novamente.');
      }
    }
  );

  // Alternar status da regra
  const toggleStatusMutation = useMutation(
    async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch(`/email-rules/${id}/status`, { isActive });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('email-rules');
        toast.success('Status da regra atualizado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao atualizar status da regra. Tente novamente.');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRule) {
      updateMutation.mutate({ id: selectedRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rule: EmailRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      fromEmail: rule.fromEmail,
      subject: rule.subject || '',
      body: rule.body || '',
      response: rule.response
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setSelectedRule(null);
    setFormData({
      name: '',
      fromEmail: '',
      subject: '',
      body: '',
      response: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Regras de Email
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                  Gerencie as regras de resposta automática para seus emails.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Nova Regra
                </button>
              </div>
            </div>

            {/* Lista de Regras */}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Nome
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Assunto
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Última Atualização
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="py-10">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : !rules?.length ? (
                        <tr>
                          <td colSpan={6} className="py-10">
                            <div className="text-center text-gray-500">
                              Nenhuma regra encontrada
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {rule.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {rule.fromEmail}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {rule.subject || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <button
                                onClick={() => toggleStatusMutation.mutate({ id: rule.id, isActive: !rule.isActive })}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  rule.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {rule.isActive ? (
                                  <CheckCircleIcon className="mr-1 h-4 w-4 text-green-400" />
                                ) : (
                                  <XCircleIcon className="mr-1 h-4 w-4 text-gray-400" />
                                )}
                                {rule.isActive ? 'Ativo' : 'Inativo'}
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {format(new Date(rule.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              <button
                                onClick={() => handleEdit(rule)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                                <span className="sr-only">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDelete(rule.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                                <span className="sr-only">Excluir</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal de Formulário */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                <div className="fixed inset-0 z-10 overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                      <form onSubmit={handleSubmit}>
                        <div>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {selectedRule ? 'Editar Regra' : 'Nova Regra'}
                          </h3>
                          <div className="mt-6 space-y-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nome da Regra
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                                Email do Remetente
                              </label>
                              <input
                                type="email"
                                name="fromEmail"
                                id="fromEmail"
                                value={formData.fromEmail}
                                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                Assunto (opcional)
                              </label>
                              <input
                                type="text"
                                name="subject"
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                Conteúdo do Email (opcional)
                              </label>
                              <textarea
                                name="body"
                                id="body"
                                rows={3}
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                                Resposta Automática
                              </label>
                              <textarea
                                name="response"
                                id="response"
                                rows={4}
                                value={formData.response}
                                onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                          >
                            {selectedRule ? 'Salvar Alterações' : 'Criar Regra'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsModalOpen(false);
                              resetForm();
                            }}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 