'use client';

import { useEffect, useState } from 'react';

interface SubmissionRow {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  shape: string | null;
  size: string;
  material: string | null;
  finish: string | null;
  price: number;
  compareAtPrice: number | null;
  startingStock: number;
  mainImageUrl: string;
  createdAt: string;
}

export default function AdminPage() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/submissions');
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to load submissions. Is the database connected?',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this row? This cannot be undone.')) return;
    setDeletingId(id);
    await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
    await load();
    setDeletingId(null);
  };

  const productCount = new Set(rows.map((r) => r.productCode)).size;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Submitted Products</h1>
            <p className="text-sm text-stone-600">
              {rows.length} rows across {productCount} products
            </p>
          </div>
          <a
            href="/api/admin/export"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Download as Excel
          </a>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Couldn&rsquo;t load submissions: {loadError}
            <button onClick={load} className="ml-2 font-semibold underline">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-stone-500">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900 text-white">
                <tr>
                  <Th>Product Code</Th>
                  <Th>Name</Th>
                  <Th>Category</Th>
                  <Th>Shape</Th>
                  <Th>Size</Th>
                  <Th>Material</Th>
                  <Th>Finish</Th>
                  <Th>Price</Th>
                  <Th>Compare-at</Th>
                  <Th>Stock</Th>
                  <Th>Image</Th>
                  <Th>Submitted</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-stone-100">
                    <Td className="font-mono">{row.productCode}</Td>
                    <Td className="font-medium">{row.productName}</Td>
                    <Td>{row.category}</Td>
                    <Td>{row.shape ?? '—'}</Td>
                    <Td>{row.size}</Td>
                    <Td>{row.material ?? '—'}</Td>
                    <Td>{row.finish ?? '—'}</Td>
                    <Td>₹{row.price.toLocaleString('en-IN')}</Td>
                    <Td>{row.compareAtPrice ? `₹${row.compareAtPrice.toLocaleString('en-IN')}` : '—'}</Td>
                    <Td>{row.startingStock}</Td>
                    <Td>
                      <a
                        href={row.mainImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </Td>
                    <Td>{new Date(row.createdAt).toLocaleString('en-IN')}</Td>
                    <Td>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === row.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold whitespace-nowrap">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 whitespace-nowrap ${className ?? ''}`}>{children}</td>;
}
