import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Profile, UpdateEmailSettingsDTO } from '../services/profile';

const emailSettingsSchema = z.object({
  imapHost: z.string().min(1, 'Host IMAP é obrigatório'),
  imapPort: z.coerce
    .number()
    .min(1, 'Porta IMAP deve ser maior que 0')
    .max(65535, 'Porta IMAP deve ser menor que 65536'),
  imapUser: z.string().min(1, 'Usuário IMAP é obrigatório'),
  imapPassword: z.string().optional(),
  smtpHost: z.string().min(1, 'Host SMTP é obrigatório'),
  smtpPort: z.coerce
    .number()
    .min(1, 'Porta SMTP deve ser maior que 0')
    .max(65535, 'Porta SMTP deve ser menor que 65536'),
  smtpUser: z.string().min(1, 'Usuário SMTP é obrigatório'),
  smtpPassword: z.string().optional(),
  fromName: z.string().min(1, 'Nome do remetente é obrigatório'),
  fromEmail: z.string().email('E-mail do remetente inválido'),
});

interface EmailSettingsFormProps {
  profile: Profile;
  onSubmit: (data: UpdateEmailSettingsDTO) => Promise<void>;
  onTest: () => Promise<void>;
}

export function EmailSettingsForm({
  profile,
  onSubmit,
  onTest,
}: EmailSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateEmailSettingsDTO>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      ...profile.emailSettings,
      imapPassword: '',
      smtpPassword: '',
    },
  });

  const handleFormSubmit = async (data: UpdateEmailSettingsDTO) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      await onTest();
      alert('Configurações testadas com sucesso!');
    } catch (error) {
      alert('Erro ao testar configurações. Verifique os dados e tente novamente.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Configurações IMAP
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure as credenciais para recebimento de e-mails.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="imapHost"
                className="block text-sm font-medium text-gray-700"
              >
                Host IMAP
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="imapHost"
                  {...register('imapHost')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.imapHost && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.imapHost.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="imapPort"
                className="block text-sm font-medium text-gray-700"
              >
                Porta IMAP
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="imapPort"
                  {...register('imapPort')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.imapPort && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.imapPort.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="imapUser"
                className="block text-sm font-medium text-gray-700"
              >
                Usuário IMAP
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="imapUser"
                  {...register('imapUser')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.imapUser && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.imapUser.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="imapPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Senha IMAP
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="imapPassword"
                  {...register('imapPassword')}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.imapPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.imapPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Configurações SMTP
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure as credenciais para envio de e-mails.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="smtpHost"
                className="block text-sm font-medium text-gray-700"
              >
                Host SMTP
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="smtpHost"
                  {...register('smtpHost')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.smtpHost && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.smtpHost.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="smtpPort"
                className="block text-sm font-medium text-gray-700"
              >
                Porta SMTP
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="smtpPort"
                  {...register('smtpPort')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.smtpPort && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.smtpPort.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="smtpUser"
                className="block text-sm font-medium text-gray-700"
              >
                Usuário SMTP
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="smtpUser"
                  {...register('smtpUser')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.smtpUser && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.smtpUser.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="smtpPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Senha SMTP
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="smtpPassword"
                  {...register('smtpPassword')}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.smtpPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.smtpPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Configurações de Remetente
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure as informações do remetente para os e-mails enviados.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="fromName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome do Remetente
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="fromName"
                  {...register('fromName')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.fromName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fromName.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="fromEmail"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail do Remetente
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="fromEmail"
                  {...register('fromEmail')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.fromEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fromEmail.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isTesting ? 'Testando...' : 'Testar Configurações'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
} 