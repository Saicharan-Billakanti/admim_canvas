import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateProductRows, ValidationError } from '@/lib/validate';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const rows = validateProductRows(body);

    await prisma.productRow.createMany({
      data: rows.map((row) => ({
        productCode: row.productCode,
        productName: row.productName,
        category: row.category,
        shape: row.shape,
        size: row.size,
        material: row.material,
        finish: row.finish,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        startingStock: row.startingStock,
        description: row.description,
        mainImageUrl: row.mainImageUrl,
        additionalImageUrls: row.additionalImageUrls,
      })),
    });

    return NextResponse.json({ success: true, rowCount: rows.length });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Submission failed:', err);
    return NextResponse.json({ error: 'Something went wrong saving your submission. Please try again.' }, { status: 500 });
  }
}
