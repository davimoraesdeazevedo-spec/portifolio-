'use client';

// Emissão de alertas manuais — visível para Controle de Qualidade e Supervisor.

import CrudResource from '@/components/CrudResource';
import { Badge, PageHeader } from '@/components/ui';
import { useAuth } from '@/components/AuthProvider';
import { ALERTA_NIVEIS } from '@/lib/labels';
import { formatDateTime } from '@/lib/format';

export default function AlertasPage() {
  const { usuario } = useAuth();

  return (
    <>
      <PageHeader
        title="Alertas"
        subtitle="Alertas emitidos pelo Controle de Qualidade aparecem no painel de controle."
      />

      <CrudResource
        endpoint="/api/alertas"
        title="Alertas emitidos"
        createLabel="Emitir alerta"
        searchable
        searchPlaceholder="Pesquisar alerta…"
        formNote="O alerta passa a aparecer no painel de controle assim que for salvo."
        transformBody={(body) => ({ ...body, autor: usuario?.nome ?? null })}
        fields={[
          { name: 'nivel', label: 'Nível', type: 'select', options: ALERTA_NIVEIS, defaultValue: 'atencao', required: true },
          {
            name: 'mensagem',
            label: 'Mensagem do alerta',
            type: 'textarea',
            full: true,
            required: true,
            placeholder: 'Ex.: Câmara 02 acima do limite por 2 horas — ação corretiva aberta.',
          },
          { name: 'modulo', label: 'Módulo / setor', type: 'text', placeholder: 'Ex.: Temperaturas' },
        ]}
        columns={[
          {
            key: 'nivel',
            label: 'Nível',
            render: (row) => (row.nivel === 'critico' ? <Badge tone="crit">Crítico</Badge> : <Badge tone="warn">Atenção</Badge>),
          },
          { key: 'mensagem', label: 'Mensagem', render: (row) => <span className="cell-strong">{row.mensagem}</span> },
          { key: 'modulo', label: 'Módulo', render: (row) => row.modulo || '—' },
          { key: 'autor', label: 'Emitido por', render: (row) => row.autor || '—' },
          { key: 'created_at', label: 'Data/hora', render: (row) => formatDateTime(row.created_at) },
        ]}
        filters={[{ name: 'nivel', label: 'Nível', options: ALERTA_NIVEIS }]}
        emptyText="Nenhum alerta emitido."
      />
    </>
  );
}
