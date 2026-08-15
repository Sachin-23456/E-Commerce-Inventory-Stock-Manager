import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  PackageSearch,
  Search,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthHeader } from '../components/AuthHeader';
import { InventoryGrid } from '../components/InventoryGrid';
import { ProductForm } from '../components/ProductForm';
import { useDebounce } from '../hooks/useDebounce';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../providers/AuthProvider';
import type { StockStatus } from '../types/database';

const statusOptions: Array<{ value: StockStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' }
];

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: typeof CheckCircle2;
  tone: 'success' | 'primary' | 'warning';
  children?: React.ReactNode;
};

function StatCard({ title, value, description, icon: Icon, tone, children }: StatCardProps) {
  const toneClasses = {
    success: 'bg-success/10 text-success',
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning'
  };

  return (
    <div className="panel p-5 transition duration-200 hover:-translate-y-1 hover:shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{title}</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-md ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { profile, user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const inventory = useInventory(profile?.store_id, user?.id);
  const { setFilters } = inventory;

  useEffect(() => {
    setFilters((current) => ({ ...current, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const lowOrOutCount = inventory.products.filter((product) => product.quantity <= product.low_stock_threshold).length;

  return (
    <main className="min-h-screen bg-background">
      <AuthHeader />
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-md border border-border bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(22,163,74,0.08),rgba(245,158,11,0.08))] p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Operations overview
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Stock control for today&apos;s store activity
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Search SKUs, watch stock health, and record inventory changes from one manager
                workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="metric-tile">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Store
                </p>
                <p className="mt-1 truncate text-lg font-black">{profile?.store_name ?? 'Store'}</p>
              </div>
              <div className="metric-tile">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Filtered
                </p>
                <p className="mt-1 text-lg font-black">{inventory.filteredProducts.length} items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Stock Health"
            value={`${inventory.stockProgress.percentage}%`}
            description={`${inventory.stockProgress.inStock} / ${inventory.stockProgress.total} products in stock`}
            icon={TrendingUp}
            tone="success"
          >
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${inventory.stockProgress.percentage}%` }}
              />
            </div>
          </StatCard>

          <StatCard
            title="Tracked Products"
            value={inventory.products.length}
            description="Store-scoped inventory records"
            icon={Boxes}
            tone="primary"
          />

          <StatCard
            title="Needs Attention"
            value={lowOrOutCount}
            description="Low-stock or out-of-stock items"
            icon={AlertTriangle}
            tone="warning"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
          <ProductForm onSubmit={inventory.addProduct} />

          <div className="space-y-4">
            <div className="panel p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-black">Inventory Directory</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fast product lookup with debounced search and status filters.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_230px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="input pl-10"
                    placeholder="Search by product name or SKU"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                </label>

                <label className="relative block">
                  <PackageSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    className="input pl-10"
                    value={inventory.filters.status}
                    onChange={(event) =>
                      inventory.setFilters((current) => ({
                        ...current,
                        status: event.target.value as StockStatus | 'all'
                      }))
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <InventoryGrid
              products={inventory.filteredProducts}
              loading={inventory.loading}
              onAdjustStock={inventory.adjustStock}
              onMarkReordered={inventory.markReordered}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
