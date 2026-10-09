// Presentational building blocks shared by every module page.

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div className="row row--between">
        <div>
          <h2 className="page-title">{title}</h2>
          {subtitle ? <p className="page-sub">{subtitle}</p> : null}
        </div>
        {children ? <div className="card-actions">{children}</div> : null}
      </div>
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || actions ? (
        <header className="card-head">
          <div>
            {title ? <h3 className="card-title">{title}</h3> : null}
            {subtitle ? <p className="card-sub">{subtitle}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, tone = '' }) {
  return (
    <div className={`kpi${tone ? ` kpi--${tone}` : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {hint ? <div className="kpi-hint">{hint}</div> : null}
    </div>
  );
}

export function Badge({ tone = '', children }) {
  return <span className={`badge${tone ? ` badge--${tone}` : ''}`}>{children}</span>;
}

/** Green/red badge for a boolean "conforme" column. */
export function ConformidadeBadge({ value, trueLabel = 'Conforme', falseLabel = 'Não conforme' }) {
  if (value === null || value === undefined) return <Badge>Sem avaliação</Badge>;
  return value ? <Badge tone="ok">✓ {trueLabel}</Badge> : <Badge tone="crit">✕ {falseLabel}</Badge>;
}

export function ProgressBar({ value, max = 100, tone = '' }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="progress">
      <div className={`progress-bar${tone ? ` progress-bar--${tone}` : ''}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function BarRow({ label, value, max, hint, tone = '' }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar-value">{hint}</span>
      <ProgressBar value={value} max={max} tone={tone} />
    </div>
  );
}

export function AlertList({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return <p className="muted text-sm">Nenhum alerta automático no momento. Todos os controles estão dentro dos limites.</p>;
  }
  return (
    <div className="alert-list">
      {alertas.map((alerta) => (
        <a key={`${alerta.modulo}-${alerta.mensagem}`} href={alerta.href} className={`alert alert--${alerta.nivel}`}>
          <span className="alert-icon" aria-hidden="true">{alerta.nivel === 'critico' ? '⛔' : '⚠️'}</span>
          <span>
            <span className="alert-module">{alerta.modulo}</span>
            <br />
            {alerta.mensagem}
          </span>
        </a>
      ))}
    </div>
  );
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className={`tab${value === item.value ? ' active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows, loading, empty = 'Nenhum registro encontrado.', renderActions, actionsLabel = 'Ações', rowKey = 'id' }) {
  if (loading) return <div className="loading">Carregando registros…</div>;
  if (!rows || rows.length === 0) return <div className="empty">{empty}</div>;

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.numeric ? 'num' : undefined}>{column.label}</th>
            ))}
            {renderActions ? <th className="num">{actionsLabel}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[rowKey] ?? index}>
              {columns.map((column) => (
                <td key={column.key} className={column.numeric ? 'num' : undefined}>
                  {column.render ? column.render(row) : (row[column.key] ?? '—')}
                </td>
              ))}
              {renderActions ? <td className="num">{renderActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeOptions(options) {
  return (options ?? []).map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );
}

/** Renders one form control with its label, used by forms and CrudResource. */
export function FieldRenderer({ field, value, onChange, idPrefix = '' }) {
  const id = `${idPrefix}${field.name}`;
  const options = normalizeOptions(field.options);

  if (field.type === 'checkbox') {
    return (
      <label className="field-check" htmlFor={id}>
        <input id={id} type="checkbox" checked={!!value} onChange={(event) => onChange(field.name, event.target.checked)} />
        {field.label}
      </label>
    );
  }

  let control;
  if (field.type === 'select') {
    control = (
      <select id={id} className="select" value={value ?? ''} required={field.required} onChange={(event) => onChange(field.name, event.target.value)}>
        <option value="">{field.placeholder ?? 'Selecione…'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = (
      <textarea id={id} className="textarea" value={value ?? ''} placeholder={field.placeholder} required={field.required} onChange={(event) => onChange(field.name, event.target.value)} />
    );
  } else if (field.type === 'file') {
    control = (
      <>
        <input id={id} type="file" className="input" accept={field.accept} onChange={(event) => onChange(field.name, event.target.files?.[0] ?? null)} />
        {typeof value === 'string' && value ? (
          <a className="link text-sm" href={value} target="_blank" rel="noreferrer">Ver arquivo atual</a>
        ) : null}
      </>
    );
  } else {
    control = (
      <input
        id={id}
        className="input"
        type={field.type ?? 'text'}
        step={field.step}
        value={value ?? ''}
        placeholder={field.placeholder}
        required={field.required}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    );
  }

  return (
    <div className={`field${field.full ? ' field--full' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.required ? <span className="req"> *</span> : null}
      </label>
      {control}
      {field.help ? <span className="field-help">{field.help}</span> : null}
    </div>
  );
}
