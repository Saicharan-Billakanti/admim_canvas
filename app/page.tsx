'use client';

import { useState } from 'react';
import { CATEGORIES, SHAPES, MATERIALS, FINISHES, CATEGORIES_WITH_SHAPE } from '@/lib/catalog-options';

interface VariantRow {
  key: string;
  shape: string;
  size: string;
  material: string;
  finish: string;
  price: string;
  compareAtPrice: string;
  startingStock: string;
}

function emptyVariant(): VariantRow {
  return {
    key: crypto.randomUUID(),
    shape: '',
    size: '',
    material: '',
    finish: '',
    price: '',
    compareAtPrice: '',
    startingStock: '',
  };
}

export default function ProductSubmissionForm() {
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [additionalImageUrls, setAdditionalImageUrls] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const showShape = CATEGORIES_WITH_SHAPE.has(category);

  const updateVariant = (key: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (key: string) =>
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.key !== key) : prev));

  const resetForm = () => {
    setProductCode('');
    setProductName('');
    setCategory('');
    setDescription('');
    setMainImageUrl('');
    setAdditionalImageUrls('');
    setVariants([emptyVariant()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const rows = variants.map((v) => ({
      productCode,
      productName,
      category,
      shape: showShape ? v.shape || undefined : undefined,
      size: v.size,
      material: v.material || undefined,
      finish: v.finish || undefined,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      startingStock: Number(v.startingStock || 0),
      description: description || undefined,
      mainImageUrl,
      additionalImageUrls: additionalImageUrls || undefined,
    }));

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      setStatus('success');
      resetForm();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Canvas India — Product Submission</h1>
          <p className="mt-1 text-sm text-stone-600">
            Fill in your product details below. If it comes in multiple sizes or finishes, add a row for each —
            every row you add shares the same product name, category, and images.
          </p>
        </div>

        {status === 'success' && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Product submitted successfully. You can submit another product below.
          </div>
        )}
        {status === 'error' && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">Product Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Product Code" required>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="e.g. CNV-001"
                  className={inputClass}
                />
              </Field>
              <Field label="Product Name" required>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Classic Family Photo Canvas"
                  className={inputClass}
                />
              </Field>
              <Field label="Category" required>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Main Image URL (Cloudinary)" required>
                <input
                  type="url"
                  required
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className={inputClass}
                />
              </Field>
              <Field label="Additional Image URLs (comma-separated)" className="sm:col-span-2">
                <input
                  type="text"
                  value={additionalImageUrls}
                  onChange={(e) => setAdditionalImageUrls(e.target.value)}
                  placeholder="https://..., https://..."
                  className={inputClass}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Sizes &amp; Pricing
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-700"
              >
                + Add Another Size/Finish
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={v.key} className="rounded-lg border border-stone-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">Row {idx + 1}</span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(v.key)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {showShape && (
                      <Field label="Shape">
                        <select
                          value={v.shape}
                          onChange={(e) => updateVariant(v.key, { shape: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">—</option>
                          {SHAPES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Size" required>
                      <input
                        type="text"
                        required
                        value={v.size}
                        onChange={(e) => updateVariant(v.key, { size: e.target.value })}
                        placeholder='e.g. 8" x 10"'
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Material">
                      <select
                        value={v.material}
                        onChange={(e) => updateVariant(v.key, { material: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {MATERIALS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Finish / Style">
                      <select
                        value={v.finish}
                        onChange={(e) => updateVariant(v.key, { finish: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {FINISHES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Price (INR)" required>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Compare-at Price (INR)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.compareAtPrice}
                        onChange={(e) => updateVariant(v.key, { compareAtPrice: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Starting Stock" required>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={v.startingStock}
                        onChange={(e) => updateVariant(v.key, { startingStock: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-lg bg-[#E8752A] py-3 text-sm font-bold text-white hover:bg-[#d0641e] disabled:opacity-60"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-[#0E4A93] focus:outline-none focus:ring-1 focus:ring-[#0E4A93]';

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-xs font-medium text-stone-700 ${className ?? ''}`}>
      {label} {required && <span className="text-red-500">*</span>}
      {children}
    </label>
  );
}
