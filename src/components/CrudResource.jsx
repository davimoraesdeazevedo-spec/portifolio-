'use client';

// Generic list + create form used by most modules.
// The same component drives every CRUD screen so the modules stay consistent.
//
// O cargo do usuário decide o que aparece: quem não pode criar não vê o
// formulário; quem não pode editar/excluir não vê as ações da linha.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, DataTable, FieldRenderer } from './ui';
import { useDebounced } from '@/lib/use-fetch';
import { uploadFile } from '@/lib/api-client';
import { useAuth } from './AuthProvider';

function initialValues(fields, overrides = {}) {
  const values = {};
  for (const field of fields) {
    if (field.omitFromForm) continue;
    values[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
  }
  return { ...values, ...overrides };
}

export default function CrudResource({
  endpoint,
  title,
  subtitle,
  fields = [],
  columns = [],
  filterParams,
  filters = [],
  searchable = false,
  searchPlaceholder = 'Pesquisar…',
  createLabel = 'Novo registro',
  emptyText = 'Nenhum registro encontrado.',
  rowActions,
  allowDelete = true,
  derive,
  transformBody,
  headerExtra,
  formNote,
  formOverrides,
  formTitle,
  defaultFormOpen = false,
  onLoaded,
}) {
  const { pode } = useAuth();
  const canCreate = fields.length > 0 && pode('criar');
  const canEdit = pode('editar');
  const canDelete = allowDelete && pode('excluir');

  // Held in a ref so an inline callback from the parent can never retrigger a fetch.
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(defaultFormOpen && canCreate);
  const [values, setValues] = useState(() => initialValues(fields, formOverrides));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [filterValues, setFilterValues] = useState({});
  const [busyId, setBusyId] = useState(null);

  const filterKey = JSON.stringify(filterParams ?? {});
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(JSON.parse(filterKey))) {
      if (value === undefined || value === null || value === '') continue;
      params.set(key, value);
    }
    for (const [key, value] of Object.entries(filterValues)) {
      if (value === undefined || value === null || value === '') continue;
      params.set(key, value);
    }
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    const query = params.toString();
    return query ? `?${query}` : '';
  }, [filterKey, filterValues, debouncedSearch]);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${endpoint}${queryString}`, { cache: 'no-store' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Erro ${response.status}`);
      const loaded = body.data ?? [];
      setRows(loaded);
      onLoadedRef.current?.(loaded);
      setError(null);
    } catch (caught) {
      setError(caught.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, queryString]);

  useEffect(() => {
    load();
  }, [load]);

  function setField(name, value) {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      return derive ? derive(next, name) : next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const body = {};
      for (const field of fields) {
        if (field.omitFromForm) continue;
        const value = values[field.name];

        if (field.type === 'file') {
          if (value instanceof File) {
            const uploaded = await uploadFile(value);
            body[field.name] = uploaded.url;
            if (field.storeNameAs) body[field.storeNameAs] = uploaded.nome;
          }
          continue;
        }

        if (value === undefined) continue;
        if (value === '' && !field.required) {
          body[field.name] = null;
          continue;
        }
        body[field.name] = value;
      }

      const payload = transformBody ? transformBody(body) : body;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const parsed = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parsed.error || 'Não foi possível salvar o registro');

      setValues(initialValues(fields, formOverrides));
      setShowForm(false);
      await load();
    } catch (caught) {
      setFormError(caught.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!window.confirm('Excluir este registro? Esta ação não pode ser desfeita.')) return;
    setBusyId(row.id);
    try {
      const response = await fetch(`${endpoint}/${row.id}`, { method: 'DELETE' });
      const parsed = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parsed.error || 'Não foi possível excluir');
      await load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusyId(null);
    }
  }

  const hasActions = Boolean(rowActions && canEdit) || canDelete;
  // Stable, selector-friendly ids for the generated form controls.
  const idPrefix = `${endpoint.replace(/[^a-zA-Z0-9]+/g, '_')}_`;

  return (
    <Card
      title={title}
      subtitle={subtitle ?? `${rows.length} registro(s)${loading ? '' : ' exibido(s)'}`}
      actions={
        <>
          {headerExtra}
          {searchable ? (
            <input
              className="input input--inline"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          ) : null}
          {canCreate ? (
            <button type="button" className="btn btn--primary" onClick={() => setShowForm((open) => !open)}>
              {showForm ? 'Fechar formulário' : `+ ${createLabel}`}
            </button>
          ) : null}
        </>
      }
    >
      {filters.length > 0 ? (
        <div className="toolbar" style={{ marginBottom: 14 }}>
          {filters.map((filter) => (
            <label key={filter.name} className="field" style={{ minWidth: 180 }}>
              <span className="field-label">{filter.label}</span>
              <select
                className="select"
                value={filterValues[filter.name] ?? ''}
                onChange={(event) => setFilterValues((previous) => ({ ...previous, [filter.name]: event.target.value }))}
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {error ? <div className="alert alert--crit" style={{ marginBottom: 14 }}>⚠️ {error}</div> : null}

      {showForm && canCreate ? (
        <form onSubmit={submit} style={{ marginBottom: 10 }}>
          <h4 className="card-title" style={{ marginBottom: 12 }}>{formTitle ?? createLabel}</h4>
          <div className="form-grid">
            {fields.filter((field) => !field.omitFromForm).map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={values[field.name]}
                onChange={setField}
                idPrefix={idPrefix}
              />
            ))}
          </div>
          {formNote ? <p className="form-note">{formNote}</p> : null}
          {formError ? <p className="form-note" style={{ color: 'var(--crit)' }}>⚠️ {formError}</p> : null}
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar registro'}
            </button>
            <button type="button" className="btn" onClick={() => setShowForm(false)} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        empty={emptyText}
        renderActions={
          hasActions
            ? (row) => (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  {rowActions && canEdit ? rowActions(row, load) : null}
                  {canDelete ? (
                    <button type="button" className="btn btn--sm btn--danger" disabled={busyId === row.id} onClick={() => remove(row)}>
                      Excluir
                    </button>
                  ) : null}
                </div>
              )
            : undefined
        }
      />
    </Card>
  );
}
