'use client';

// Aba de gestão de logins — visível apenas para o cargo Supervisor.

import CrudResource from '@/components/CrudResource';
import { Badge, Card, PageHeader } from '@/components/ui';
import { CARGOS, labelCargo } from '@/lib/roles';
import { formatDateTime } from '@/lib/format';

export default function UsuariosPage() {
  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Contas que acessam o sistema. Supervisor e Controle de Qualidade veem e gerenciam esta aba."
      />

      <CrudResource
        endpoint="/api/usuarios"
        title="Logins"
        createLabel="Novo usuário"
        searchable
        searchPlaceholder="Pesquisar por nome ou cargo…"
        fields={[
          { name: 'nome', label: 'Nome', type: 'text', required: true, placeholder: 'Ex.: Maria Souza' },
          { name: 'cargo', label: 'Cargo', type: 'select', options: CARGOS, required: true },
          { name: 'ativo', label: 'Conta ativa', type: 'checkbox', defaultValue: true },
        ]}
        columns={[
          { key: 'nome', label: 'Nome', render: (row) => <span className="cell-strong">{row.nome}</span> },
          { key: 'cargo', label: 'Cargo', render: (row) => <Badge tone="info">{labelCargo(row.cargo)}</Badge> },
          {
            key: 'ativo',
            label: 'Situação',
            render: (row) => (row.ativo ? <Badge tone="ok">Ativa</Badge> : <Badge tone="warn">Desativada</Badge>),
          },
          { key: 'created_at', label: 'Criada em', render: (row) => formatDateTime(row.created_at) },
        ]}
        filters={[{ name: 'cargo', label: 'Cargo', options: CARGOS }]}
        emptyText="Nenhum usuário cadastrado ainda."
      />

      <Card title="Como funciona o acesso">
        <ul className="rule-list">
          <li>Todas as contas usam a mesma senha do estabelecimento.</li>
          <li>
            <strong>Funcionário</strong> (cargo base/auxiliar) apenas visualiza; <strong>Operador</strong> pode
            adicionar registros; <strong>Controle de Qualidade</strong> e <strong>Supervisor</strong> fazem tudo —
            registros, alertas e a gestão das contas.
          </li>
          <li>
            Ao entrar, se o nome ainda não existir, a conta é criada com o cargo escolhido. Depois disso, apenas supervisor e controle de qualidade
            alteram o cargo ou desativam a conta.
          </li>
        </ul>
      </Card>
    </>
  );
}
