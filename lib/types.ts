export interface ProductRowInput {
  productCode: string;
  productName: string;
  category: string;
  shape?: string;
  size: string;
  material?: string;
  finish?: string;
  price: number;
  compareAtPrice?: number;
  startingStock: number;
  description?: string;
  mainImageUrl: string;
  additionalImageUrls?: string;
}
