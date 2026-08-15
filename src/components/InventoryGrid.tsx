import { AlertTriangle, CheckCircle2, Package, RotateCcw } from 'lucide-react';
import type { Product } from '../types/database';
import { getStockStatus, stockStatusClasses, stockStatusLabel } from '../utils/stock';
import { InventoryCard } from './InventoryCard';
import { StockAdjustmentForm } from './StockAdjustmentForm';

type InventoryGridProps = {
  products: Product[];
  loading: boolean;
  onAdjustStock: (product: Product, delta: number) => Promise<void>;
  onMarkReordered: (product: Product) => Promise<void>;
};

export function InventoryGrid({
  products,
  loading,
  onAdjustStock,
  onMarkReordered
}: InventoryGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-56" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="panel border-dashed p-10 text-center">
        <h2 className="text-xl font-bold">No matching products</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add inventory or adjust your search and stock status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {products.map((product) => {
        const status = getStockStatus(product);
        const StatusIcon = status === 'in_stock' ? CheckCircle2 : AlertTriangle;
        return (
          <InventoryCard key={product.id}>
            <InventoryCard.Header>
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black tracking-tight">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">SKU {product.sku}</p>
                </div>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${stockStatusClasses[status]}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {stockStatusLabel[status]}
              </span>
            </InventoryCard.Header>

            <InventoryCard.Body>
              <div className="grid grid-cols-3 gap-3">
                <div className="metric-tile">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Quantity</p>
                  <p className="mt-2 text-3xl font-black">{product.quantity}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Low at</p>
                  <p className="mt-2 text-3xl font-black">{product.low_stock_threshold}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Reorder</p>
                  <p className="mt-3 text-sm font-black">{product.reordered ? 'Flagged' : 'Clear'}</p>
                </div>
              </div>
            </InventoryCard.Body>

            <InventoryCard.Actions>
              <StockAdjustmentForm onAdjust={(delta) => onAdjustStock(product, delta)} />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void onMarkReordered(product)}
                disabled={product.reordered}
              >
                <RotateCcw className="h-4 w-4" />
                {product.reordered ? 'Reordered' : 'Mark Reordered'}
              </button>
            </InventoryCard.Actions>
          </InventoryCard>
        );
      })}
    </div>
  );
}
