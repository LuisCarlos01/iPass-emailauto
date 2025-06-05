import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ProfileForm } from '../components/ProfileForm';
import { EmailSettingsForm } from '../components/EmailSettingsForm';
import { profileService } from '../services/profile';

export function Profile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.get,
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    },
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: profileService.updateEmailSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Configurações de e-mail atualizadas com sucesso!');
    },
    onError: () => {
      toast.error(
        'Erro ao atualizar configurações de e-mail. Tente novamente.',
      );
    },
  });

  const testEmailSettingsMutation = useMutation({
    mutationFn: profileService.testEmailSettings,
    onSuccess: () => {
      toast.success('Configurações de e-mail testadas com sucesso!');
    },
    onError: () => {
      toast.error(
        'Erro ao testar configurações de e-mail. Verifique os dados e tente novamente.',
      );
    },
  });

  if (isLoading || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Perfil
          </h1>

          <div className="mt-8 space-y-12">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <ProfileForm
                profile={profile}
                onSubmit={updateProfileMutation.mutateAsync}
              />
            </div>

            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <EmailSettingsForm
                profile={profile}
                onSubmit={updateEmailSettingsMutation.mutateAsync}
                onTest={testEmailSettingsMutation.mutateAsync}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 