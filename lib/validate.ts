import { CATEGORIES, SHAPES, MATERIALS, FINISHES } from './catalog-options';
import type { ProductRowInput } from './types';

const MAX_STRING_LENGTH = 2000;
const URL_PATTERN = /^https?:\/\/.+/i;

export class ValidationError extends Error {}

function requireString(value: unknown, field: string, maxLength = MAX_STRING_LENGTH): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} is required.`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} is too long.`);
  }
  return value.trim();
}

function optionalString(value: unknown, field: string, maxLength = MAX_STRING_LENGTH): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be text.`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} is too long.`);
  }
  return value.trim();
}

function requireEnum(value: unknown, field: string, allowed: string[]): string {
  const v = requireString(value, field);
  if (!allowed.includes(v)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return v;
}

function optionalEnum(value: unknown, field: string, allowed: string[]): string | undefined {
  const v = optionalString(value, field);
  if (v === undefined) return undefined;
  if (!allowed.includes(v)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return v;
}

function requirePositiveNumber(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new ValidationError(`${field} must be a positive number.`);
  }
  return n;
}

function optionalPositiveNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return requirePositiveNumber(value, field);
}

function requireNonNegativeInt(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new ValidationError(`${field} must be a whole number, 0 or more.`);
  }
  return n;
}

function requireImageUrl(value: unknown, field: string): string {
  const v = requireString(value, field, 1000);
  if (!URL_PATTERN.test(v)) {
    throw new ValidationError(`${field} must be a valid image link (starting with http:// or https://).`);
  }
  return v;
}

function optionalImageUrlList(value: unknown, field: string): string | undefined {
  const v = optionalString(value, field, 4000);
  if (v === undefined) return undefined;
  const urls = v.split(',').map((u) => u.trim()).filter(Boolean);
  for (const url of urls) {
    if (!URL_PATTERN.test(url)) {
      throw new ValidationError(`${field} contains an invalid link: ${url}`);
    }
  }
  return urls.join(',');
}

/** Validates and normalizes one product row submitted from the form. */
export function validateProductRow(raw: unknown): ProductRowInput {
  if (typeof raw !== 'object' || raw === null) {
    throw new ValidationError('Invalid submission.');
  }
  const r = raw as Record<string, unknown>;

  return {
    productCode: requireString(r.productCode, 'Product Code', 100),
    productName: requireString(r.productName, 'Product Name', 300),
    category: requireEnum(r.category, 'Category', CATEGORIES),
    shape: optionalEnum(r.shape, 'Shape', SHAPES),
    size: requireString(r.size, 'Size', 100),
    material: optionalEnum(r.material, 'Material', MATERIALS),
    finish: optionalEnum(r.finish, 'Finish / Style', FINISHES),
    price: requirePositiveNumber(r.price, 'Price'),
    compareAtPrice: optionalPositiveNumber(r.compareAtPrice, 'Compare-at Price'),
    startingStock: requireNonNegativeInt(r.startingStock, 'Starting Stock'),
    description: optionalString(r.description, 'Description', 2000),
    mainImageUrl: requireImageUrl(r.mainImageUrl, 'Main Image URL'),
    additionalImageUrls: optionalImageUrlList(r.additionalImageUrls, 'Additional Image URLs'),
  };
}

export function validateProductRows(raw: unknown): ProductRowInput[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ValidationError('At least one product row is required.');
  }
  if (raw.length > 200) {
    throw new ValidationError('Too many rows in one submission.');
  }
  const rows = raw.map(validateProductRow);

  const codes = new Set(rows.map((r) => r.productCode));
  if (codes.size > 1) {
    throw new ValidationError('All rows in one submission must share the same Product Code.');
  }

  return rows;
}
