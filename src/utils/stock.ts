import type { Product, StockStatus } from '../types/database';

export function getStockStatus(product: Pick<Product, 'quantity' | 'low_stock_threshold'>): StockStatus {
  if (product.quantity <= 0) return 'out_of_stock';
  if (product.quantity <= product.low_stock_threshold) return 'low_stock';
  return 'in_stock';
}

export const stockStatusLabel: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock'
};

export const stockStatusClasses: Record<StockStatus, string> = {
  in_stock: 'bg-success/10 text-success ring-success/20',
  low_stock: 'bg-warning/10 text-warning ring-warning/20',
  out_of_stock: 'bg-danger/10 text-danger ring-danger/20'
};
