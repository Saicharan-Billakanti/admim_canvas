import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.productRow.findMany({ orderBy: { createdAt: 'desc' } });
    // Decimal fields serialize to strings by default via Prisma's JSON
    // transport — convert to plain numbers here so the admin UI doesn't need
    // to know about Decimal at all.
    const serialized = rows.map((row) => ({
      ...row,
      price: Number(row.price),
      compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    }));
    return NextResponse.json({ rows: serialized });
  } catch (err) {
    console.error('Failed to load submissions:', err);
    return NextResponse.json({ error: 'Could not reach the database.' }, { status: 500 });
  }
}
