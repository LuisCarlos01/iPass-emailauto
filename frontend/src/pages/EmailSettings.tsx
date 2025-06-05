import React from 'react';
import { EmailSettingsForm } from '../components/EmailSettings/EmailSettingsForm';
import { MonitoringStatus } from '../components/Monitoring/MonitoringStatus';

export function EmailSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Configurações de E-mail</h1>
      
      <div className="space-y-8">
        <section>
          <EmailSettingsForm />
        </section>

        <section>
          <MonitoringStatus />
        </section>
      </div>
    </div>
  );
} 