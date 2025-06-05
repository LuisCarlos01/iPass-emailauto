import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';
import { EmailRulesList } from '../components/EmailRulesList';
import { EmailRuleForm } from '../components/EmailRuleForm';
import { EmailRule, emailRulesService } from '../services/emailRules';

export function EmailRules() {
  const [emailRules, setEmailRules] = useState<EmailRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmailRule, setSelectedEmailRule] = useState<EmailRule | null>(
    null,
  );

  useEffect(() => {
    loadEmailRules();
  }, []);

  const loadEmailRules = async () => {
    try {
      setIsLoading(true);
      const rules = await emailRulesService.list();
      setEmailRules(rules);
    } catch (error) {
      toast.error('Erro ao carregar regras de e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmailRule = async (data: any) => {
    try {
      await emailRulesService.create(data);
      await loadEmailRules();
      setIsFormOpen(false);
      toast.success('Regra criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar regra');
    }
  };

  const handleUpdateEmailRule = async (data: any) => {
    try {
      if (!selectedEmailRule) return;

      await emailRulesService.update(selectedEmailRule.id, data);
      await loadEmailRules();
      setIsFormOpen(false);
      setSelectedEmailRule(null);
      toast.success('Regra atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar regra');
    }
  };

  const handleDeleteEmailRule = async (emailRule: EmailRule) => {
    try {
      await emailRulesService.delete(emailRule.id);
      await loadEmailRules();
      toast.success('Regra excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir regra');
    }
  };

  const handleToggleActive = async (emailRule: EmailRule) => {
    try {
      await emailRulesService.toggleActive(emailRule.id);
      await loadEmailRules();
    } catch (error) {
      toast.error('Erro ao alterar status da regra');
    }
  };

  const handleEdit = (emailRule: EmailRule) => {
    setSelectedEmailRule(emailRule);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEmailRule(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Regras de E-mail
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure regras para respostas automáticas de e-mail.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nova Regra
          </button>
        </div>
      </div>

      <div className="mt-8">
        {emailRules.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Nenhuma regra de e-mail cadastrada.
            </p>
          </div>
        ) : (
          <EmailRulesList
            emailRules={emailRules}
            onEdit={handleEdit}
            onDelete={handleDeleteEmailRule}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={handleCloseForm}
            />

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Fechar</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <EmailRuleForm
                emailRule={selectedEmailRule}
                onSubmit={selectedEmailRule ? handleUpdateEmailRule : handleCreateEmailRule}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 