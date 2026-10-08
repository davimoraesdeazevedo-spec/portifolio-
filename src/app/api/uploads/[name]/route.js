// GET /api/uploads/:name — serves a stored attachment.

import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(_request, { params }) {
  const { name } = await params;

  // Only ever read a plain file name from the uploads directory.
  if (!/^[A-Za-z0-9._-]+$/.test(name) || path.basename(name) !== name) {
    return NextResponse.json({ error: 'Nome de arquivo inválido' }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, name);
  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': CONTENT_TYPES[path.extname(name).toLowerCase()] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${name}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
  }
}
