// POST /api/uploads — stores an attachment (PDF report, non-conformity photo)
// on the volume mounted at UPLOAD_DIR and returns the URL to reference it.
//
// Exige login e permissão de escrita (criar).

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exigirPermissao } from '@/lib/auth';
import { HttpError } from '@/lib/resource-service';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const MAX_BYTES = 15 * 1024 * 1024;

const EXTENSIONS = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function POST(request) {
  try {
    await exigirPermissao('criar');

    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Arquivo maior que o limite de 15 MB' }, { status: 400 });
    }

    const extension = EXTENSIONS[file.type] || path.extname(file.name || '').toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return NextResponse.json({ error: 'Formato não permitido. Envie PDF, JPG, PNG ou WEBP.' }, { status: 400 });
    }

    const storedName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json(
      { url: `/api/uploads/${storedName}`, nome: file.name, tamanho: file.size },
      { status: 201 }
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status >= 500) console.error('[api/uploads]', error);
    return NextResponse.json({ error: error.message || 'Falha ao enviar o arquivo' }, { status });
  }
}
