import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const HEADERS = [
  { header: 'Product Code', key: 'productCode', width: 16 },
  { header: 'Product Name', key: 'productName', width: 32 },
  { header: 'Category', key: 'category', width: 20 },
  { header: 'Shape', key: 'shape', width: 14 },
  { header: 'Size', key: 'size', width: 18 },
  { header: 'Material', key: 'material', width: 28 },
  { header: 'Finish / Style', key: 'finish', width: 22 },
  { header: 'Price (INR)', key: 'price', width: 14 },
  { header: 'Compare-at / Original Price (INR)', key: 'compareAtPrice', width: 20 },
  { header: 'Starting Stock', key: 'startingStock', width: 14 },
  { header: 'Description', key: 'description', width: 42 },
  { header: 'Main Image URL (Cloudinary)', key: 'mainImageUrl', width: 42 },
  { header: 'Additional Image URLs (Cloudinary)', key: 'additionalImageUrls', width: 46 },
  { header: 'Submitted At', key: 'createdAt', width: 20 },
];

export async function GET() {
  let rows;
  try {
    rows = await prisma.productRow.findMany({ orderBy: [{ productCode: 'asc' }, { createdAt: 'asc' }] });
  } catch (err) {
    console.error('Export failed to load rows:', err);
    return new Response(JSON.stringify({ error: 'Could not reach the database.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Product Catalog');
  sheet.columns = HEADERS;

  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1727' } };
  headerRow.alignment = { wrapText: true, vertical: 'middle' };
  headerRow.height = 28;

  for (const row of rows) {
    sheet.addRow({
      productCode: row.productCode,
      productName: row.productName,
      category: row.category,
      shape: row.shape ?? '',
      size: row.size,
      material: row.material ?? '',
      finish: row.finish ?? '',
      price: Number(row.price),
      compareAtPrice: row.compareAtPrice === null ? '' : Number(row.compareAtPrice),
      startingStock: row.startingStock,
      description: row.description ?? '',
      mainImageUrl: row.mainImageUrl,
      additionalImageUrls: row.additionalImageUrls ?? '',
      createdAt: row.createdAt.toISOString().slice(0, 16).replace('T', ' '),
    });
  }

  sheet.getColumn('price').numFmt = '#,##0';
  sheet.getColumn('compareAtPrice').numFmt = '#,##0';
  sheet.getColumn('startingStock').numFmt = '#,##0';

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.font = { name: 'Arial', size: 10 };
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `canvas-india-product-catalog-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
