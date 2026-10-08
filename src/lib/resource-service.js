// Generic, whitelist-driven CRUD used by the /api/[resource] routes.
//
// Column names and types always come from the resource registry, never from the
// request, and every value is passed as a bound parameter.

import { query } from './db';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function coerce(value, type) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  switch (type) {
    case 'number': {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'boolean':
      return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
    case 'date':
      return String(value).slice(0, 10);
    default:
      return String(value);
  }
}

/** Derived values applied before writing a row (per resource). */
const BEFORE_WRITE = {
  // The conformity of a temperature reading follows from its own limits.
  temperaturas(row) {
    const { temperatura, limite_min: min, limite_max: max } = row;
    if (temperatura === null || min === null || max === null) return row;
    if (temperatura === undefined || min === undefined || max === undefined) return row;
    return { ...row, conforme: temperatura >= min && temperatura <= max };
  },
};

export function numericId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identificador inválido');
  return id;
}

/** Keeps only whitelisted, typed columns and enforces required fields. */
function buildRow(resource, payload, { partial }) {
  if (!payload || typeof payload !== 'object') throw new HttpError(400, 'Corpo da requisição inválido');

  const row = {};
  for (const column of resource.columns) {
    const value = coerce(payload[column], resource.types?.[column] ?? 'text');
    if (value === undefined) continue;
    row[column] = value;
  }

  for (const column of resource.required ?? []) {
    if (row[column] === null) throw new HttpError(400, `Campo obrigatório: ${column}`);
    if (!partial && row[column] === undefined) throw new HttpError(400, `Campo obrigatório: ${column}`);
  }

  if (partial && Object.keys(row).length === 0) throw new HttpError(400, 'Nenhum campo para atualizar');

  return row;
}

/** Restricts a hooked row back to the whitelisted columns. */
function restrictToColumns(resource, row) {
  const result = {};
  for (const column of resource.columns) {
    if (row[column] !== undefined) result[column] = row[column];
  }
  return result;
}

export async function listRows(resourceName, resource, searchParams) {
  const where = [];
  const values = [];

  for (const [key, raw] of searchParams.entries()) {
    if (!(resource.filters ?? []).includes(key)) continue;
    values.push(coerce(raw, resource.types?.[key] ?? 'text'));
    where.push(`${key} = $${values.length}`);
  }

  const term = searchParams.get('q');
  if (term && (resource.search ?? []).length > 0) {
    values.push(`%${term}%`);
    const index = values.length;
    where.push('(' + resource.search.map((column) => `${column} ILIKE $${index}`).join(' OR ') + ')');
  }

  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 200, 1), 500);
  const sql = [
    `SELECT * FROM ${resource.table}`,
    where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
    `ORDER BY ${resource.orderBy ?? 'id DESC'}`,
    `LIMIT ${limit}`,
  ]
    .filter(Boolean)
    .join(' ');

  const { rows } = await query(sql, values);
  return rows;
}

export async function getRow(resource, id) {
  const { rows } = await query(`SELECT * FROM ${resource.table} WHERE id = $1`, [numericId(id)]);
  return rows[0] ?? null;
}

export async function createRow(resourceName, resource, payload) {
  const row = buildRow(resource, payload, { partial: false });
  const hook = BEFORE_WRITE[resourceName];
  const finalRow = restrictToColumns(resource, hook ? hook(row) : row);

  const columns = Object.keys(finalRow);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const { rows } = await query(
    `INSERT INTO ${resource.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    columns.map((column) => finalRow[column])
  );
  return rows[0];
}

export async function updateRow(resourceName, resource, id, payload) {
  const existing = await getRow(resource, id);
  if (!existing) throw new HttpError(404, 'Registro não encontrado');

  const patch = buildRow(resource, payload, { partial: true });
  const merged = { ...existing, ...patch };
  const hook = BEFORE_WRITE[resourceName];
  const finalRow = restrictToColumns(resource, hook ? hook(merged) : merged);

  const columns = Object.keys(finalRow);
  const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
  const { rows } = await query(
    `UPDATE ${resource.table} SET ${assignments.join(', ')} WHERE id = $${columns.length + 1} RETURNING *`,
    [...columns.map((column) => finalRow[column]), numericId(id)]
  );
  return rows[0];
}

export async function deleteRow(resource, id) {
  const { rowCount } = await query(`DELETE FROM ${resource.table} WHERE id = $1`, [numericId(id)]);
  if (rowCount === 0) throw new HttpError(404, 'Registro não encontrado');
  return { deleted: true };
}
