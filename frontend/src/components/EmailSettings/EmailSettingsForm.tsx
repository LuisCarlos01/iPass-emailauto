import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import api from '../../services/api';

const emailSettingsSchema = z.object({
  imapHost: z.string().min(1, 'Host IMAP é obrigatório'),
  imapPort: z.number().int().min(1, 'Porta IMAP é obrigatória'),
  imapUser: z.string().email('Usuário IMAP deve ser um e-mail válido'),
  imapPassword: z.string().min(1, 'Senha IMAP é obrigatória'),
  smtpHost: z.string().min(1, 'Host SMTP é obrigatório'),
  smtpPort: z.number().int().min(1, 'Porta SMTP é obrigatória'),
  smtpUser: z.string().email('Usuário SMTP deve ser um e-mail válido'),
  smtpPassword: z.string().min(1, 'Senha SMTP é obrigatória'),
  fromName: z.string().min(1, 'Nome do remetente é obrigatório'),
  fromEmail: z.string().email('E-mail do remetente deve ser válido')
});

type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

export function EmailSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      imapPort: 993,
      smtpPort: 587
    }
  });

  useEffect(() => {
    loadEmailSettings();
  }, []);

  async function loadEmailSettings() {
    try {
      const response = await api.get('/email-settings');
      if (response.data) {
        reset(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async function onSubmit(data: EmailSettingsFormData) {
    setIsLoading(true);
    try {
      await api.post('/email-settings', data);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestConnection() {
    setTestStatus('testing');
    try {
      await api.post('/email-settings/test');
      setTestStatus('success');
      toast.success('Conexão testada com sucesso!');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestStatus('error');
      toast.error('Erro ao testar conexão. Verifique as configurações.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Configurações de E-mail</h2>
        
        {/* Seção IMAP */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Configurações IMAP</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Host IMAP</label>
              <input
                type="text"
                {...register('imapHost')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.imapHost && (
                <p className="mt-1 text-sm text-red-600">{errors.imapHost.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Porta IMAP</label>
              <input
                type="number"
                {...register('imapPort', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.imapPort && (
                <p className="mt-1 text-sm text-red-600">{errors.imapPort.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário IMAP</label>
              <input
                type="email"
                {...register('imapUser')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.imapUser && (
                <p className="mt-1 text-sm text-red-600">{errors.imapUser.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha IMAP</label>
              <input
                type="password"
                {...register('imapPassword')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.imapPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.imapPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Seção SMTP */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Configurações SMTP</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Host SMTP</label>
              <input
                type="text"
                {...register('smtpHost')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.smtpHost && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpHost.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Porta SMTP</label>
              <input
                type="number"
                {...register('smtpPort', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.smtpPort && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpPort.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário SMTP</label>
              <input
                type="email"
                {...register('smtpUser')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.smtpUser && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpUser.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha SMTP</label>
              <input
                type="password"
                {...register('smtpPassword')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.smtpPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Seção Remetente */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Configurações do Remetente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Remetente</label>
              <input
                type="text"
                {...register('fromName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.fromName && (
                <p className="mt-1 text-sm text-red-600">{errors.fromName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail do Remetente</label>
              <input
                type="email"
                {...register('fromEmail')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.fromEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.fromEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              testStatus === 'testing'
                ? 'bg-gray-400'
                : testStatus === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : testStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {testStatus === 'testing'
              ? 'Testando...'
              : testStatus === 'success'
              ? 'Teste Bem Sucedido'
              : testStatus === 'error'
              ? 'Teste Falhou'
              : 'Testar Conexão'}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </form>
  );
} 