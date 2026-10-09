// Small formatting helpers shared by the UI (plain functions, no dependencies).

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(value)} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return number.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatQuantity(value, unidade) {
  if (value === null || value === undefined || value === '') return '—';
  const digits = Number.isInteger(Number(value)) ? 0 : 1;
  return `${formatNumber(value, digits)}${unidade ? ` ${unidade}` : ''}`;
}

export function formatPercent(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

/** Days from today until `value` (negative when already past). */
export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target.getTime() - todayUtc) / 86400000);
}

/** Convenience value for <input type="datetime-local"> / <input type="date">. */
export function nowForInput(offsetMinutes = 0) {
  const date = new Date(Date.now() + offsetMinutes * 60000);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function todayForInput() {
  return new Date().toISOString().slice(0, 10);
}
