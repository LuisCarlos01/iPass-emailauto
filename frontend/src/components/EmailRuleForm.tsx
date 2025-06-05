import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailRule } from '../services/emailRules';

const emailRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fromEmail: z.string().min(1, 'E-mail do remetente é obrigatório'),
  subject: z.string().optional(),
  body: z.string().optional(),
  response: z.string().min(1, 'Resposta automática é obrigatória'),
  isActive: z.boolean(),
});

type EmailRuleFormData = z.infer<typeof emailRuleSchema>;

interface EmailRuleFormProps {
  emailRule?: EmailRule;
  onSubmit: (data: EmailRuleFormData) => Promise<void>;
  onCancel: () => void;
}

export function EmailRuleForm({
  emailRule,
  onSubmit,
  onCancel,
}: EmailRuleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailRuleFormData>({
    resolver: zodResolver(emailRuleSchema),
    defaultValues: emailRule || {
      name: '',
      fromEmail: '',
      subject: '',
      body: '',
      response: '',
      isActive: true,
    },
  });

  const handleFormSubmit = async (data: EmailRuleFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {emailRule ? 'Editar Regra' : 'Nova Regra'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure as condições e a resposta automática para esta regra.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                {...register('name')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-4">
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

          <div className="sm:col-span-4">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Assunto (opcional)
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="subject"
                {...register('subject')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700"
            >
              Conteúdo (opcional)
            </label>
            <div className="mt-1">
              <textarea
                id="body"
                rows={3}
                {...register('body')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="response"
              className="block text-sm font-medium text-gray-700"
            >
              Resposta Automática
            </label>
            <div className="mt-1">
              <textarea
                id="response"
                rows={5}
                {...register('response')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.response && (
              <p className="mt-1 text-sm text-red-600">
                {errors.response.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Regra ativa
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
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