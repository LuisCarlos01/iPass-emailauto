import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmailLog } from '../services/emailLogs';

interface EmailLogDetailsProps {
  log: EmailLog;
  onClose: () => void;
}

export function EmailLogDetails({ log, onClose }: EmailLogDetailsProps) {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const statusColor = statusColors[log.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
          <div>
            <div className="mt-3 sm:mt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Detalhes do Log
              </h3>

              <div className="mt-6 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                      >
                        {log.status}
                      </span>
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Remetente
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {log.fromEmail}
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Assunto</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {log.subject}
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Regra Aplicada
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {log.rule?.name || 'Nenhuma regra aplicada'}
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Data de Criação
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {format(new Date(log.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Conteúdo do E-mail
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      <div className="max-h-40 overflow-y-auto rounded-md bg-gray-50 p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {log.content}
                        </pre>
                      </div>
                    </dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Resposta Enviada
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      <div className="max-h-40 overflow-y-auto rounded-md bg-gray-50 p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {log.response}
                        </pre>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 