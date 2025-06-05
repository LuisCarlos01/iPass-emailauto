import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EmailRule } from '../services/emailRules';

interface EmailRulesListProps {
  emailRules: EmailRule[];
  onEdit: (emailRule: EmailRule) => void;
  onDelete: (emailRule: EmailRule) => void;
  onToggleActive: (emailRule: EmailRule) => Promise<void>;
}

export function EmailRulesList({
  emailRules,
  onEdit,
  onDelete,
  onToggleActive,
}: EmailRulesListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleActive = async (emailRule: EmailRule) => {
    try {
      setLoadingId(emailRule.id);
      await onToggleActive(emailRule);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {emailRules.map((emailRule) => (
          <li key={emailRule.id}>
            <div className="flex items-center px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-indigo-600">
                    {emailRule.name}
                  </p>
                  <div className="ml-2 flex flex-shrink-0">
                    <Switch
                      checked={emailRule.isActive}
                      onChange={() => handleToggleActive(emailRule)}
                      disabled={loadingId === emailRule.id}
                      className={`${
                        emailRule.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          emailRule.isActive ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="truncate">
                      De: {emailRule.fromEmail}
                      {emailRule.subject && ` | Assunto: ${emailRule.subject}`}
                      {emailRule.body && ` | Conteúdo: ${emailRule.body}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-shrink-0 space-x-4">
                <button
                  type="button"
                  onClick={() => onEdit(emailRule)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(emailRule)}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 