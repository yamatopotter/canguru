import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse, type NextRequest } from 'next/server';

// Serve os uploads (logo da empresa) por uma Route Handler em vez de deixar
// pro servidor estático de public/ do Next. O build "standalone" (usado na
// imagem Docker) só serve os arquivos de public/ que existiam no momento do
// build — arquivos gravados em runtime (como um upload de logo) dão 404.
// Lendo do disco aqui, a cada request, evita esse problema.
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  // path.basename() descarta qualquer tentativa de path traversal (ex.: "../../etc/passwd").
  const safeName = path.basename(filename);
  const ext = path.extname(safeName).toLowerCase();
  const contentType = CONTENT_TYPES[ext];

  if (!contentType) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(UPLOADS_DIR, safeName));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        // O nome do arquivo já é único por upload (timestamp), então o
        // conteúdo de uma URL nunca muda — pode cachear por bastante tempo.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
