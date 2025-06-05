import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Profile, UpdateProfileDTO } from '../services/profile';

const profileSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword || data.confirmNewPassword) {
        return data.currentPassword;
      }
      return true;
    },
    {
      message: 'Senha atual é obrigatória para alterar a senha',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword) {
        return data.newPassword.length >= 8;
      }
      return true;
    },
    {
      message: 'Nova senha deve ter no mínimo 8 caracteres',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword) {
        return data.newPassword === data.confirmNewPassword;
      }
      return true;
    },
    {
      message: 'As senhas não conferem',
      path: ['confirmNewPassword'],
    },
  );

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (data: UpdateProfileDTO) => Promise<void>;
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileDTO & { confirmNewPassword: string }>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleFormSubmit = async (
    data: UpdateProfileDTO & { confirmNewPassword: string },
  ) => {
    try {
      setIsSubmitting(true);
      const { confirmNewPassword, ...profileData } = data;
      await onSubmit(profileData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Informações Pessoais
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Atualize suas informações pessoais.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Alterar Senha
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Deixe os campos em branco caso não queira alterar a senha.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Senha Atual
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="currentPassword"
                  {...register('currentPassword')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Nova Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Nova Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmNewPassword"
                  {...register('confirmNewPassword')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
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