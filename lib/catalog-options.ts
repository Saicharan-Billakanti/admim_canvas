// Mirrors the dropdown lists from the Excel sheet this form replaces, so a
// client filling in either one produces the same values.
export const CATEGORIES = [
  'Canvas',
  'Acrylic',
  'Posters',
  'Cork / Yoga & Wellness',
  'Fitness',
  'Home Decor',
  'Custom Prints',
  'Gifts',
];

export const SHAPES = ['Popular', 'Square', 'Rectangle', 'Panoramic', 'Circle', 'Triangle'];

export const MATERIALS = [
  '380 GSM Cotton Canvas',
  '5mm Cast Acrylic Glass',
  '300 GSM Heavyweight Matte Art Paper',
  '250 GSM Satin Photo Paper',
  'Natural Cork',
  'PVC Foam Board',
  'Other',
];

export const FINISHES = [
  'Print Only (Rolled)',
  'Matte Gallery Wrap',
  'Satin Lustre',
  'Matte Black Wood Frame',
  'Teak Wood Frame',
  'White Floating Frame',
  'Unframed',
];

// Shape only makes sense for categories that actually offer shaped prints —
// matches the reference site's own behavior (posters/paper goods don't show
// a shape picker).
export const CATEGORIES_WITH_SHAPE = new Set(['Canvas', 'Acrylic']);
