import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useToast } from '../providers/ToastProvider';
import type { Product, StockStatus } from '../types/database';
import { getStockStatus } from '../utils/stock';

type InventoryFilters = {
  search: string;
  status: StockStatus | 'all';
};

type ProductFormValues = {
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
};

const demoInventoryKey = 'inventory-demo-products';

const seedProducts: Product[] = [
  {
    id: 'demo-1',
    store_id: 'demo-store',
    name: 'Wireless Barcode Scanner',
    sku: 'SKU-1001',
    quantity: 24,
    low_stock_threshold: 6,
    reordered: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    store_id: 'demo-store',
    name: 'Thermal Shipping Labels',
    sku: 'SKU-1002',
    quantity: 4,
    low_stock_threshold: 10,
    reordered: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-3',
    store_id: 'demo-store',
    name: 'Packing Tape Rolls',
    sku: 'SKU-1003',
    quantity: 0,
    low_stock_threshold: 8,
    reordered: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function readDemoProducts(storeId: string) {
  const saved = localStorage.getItem(`${demoInventoryKey}-${storeId}`);
  if (saved) return JSON.parse(saved) as Product[];
  localStorage.setItem(`${demoInventoryKey}-${storeId}`, JSON.stringify(seedProducts));
  return seedProducts;
}

function saveDemoProducts(storeId: string, products: Product[]) {
  localStorage.setItem(`${demoInventoryKey}-${storeId}`, JSON.stringify(products));
}

export function useInventory(storeId?: string, profileId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({ search: '', status: 'all' });
  const { notify } = useToast();

  const loadProducts = useCallback(async () => {
    if (!storeId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setProducts(readDemoProducts(storeId));
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('updated_at', { ascending: false });

    if (error) {
      notify({ title: 'Inventory load failed', description: error.message, variant: 'error' });
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  }, [notify, storeId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filters.status === 'all' || getStockStatus(product) === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [filters.search, filters.status, products]);

  const stockProgress = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((product) => getStockStatus(product) === 'in_stock').length;
    const percentage = total === 0 ? 0 : Math.round((inStock / total) * 100);

    return { total, inStock, percentage };
  }, [products]);

  const addProduct = useCallback(
    async (values: ProductFormValues) => {
      if (!storeId || !profileId) return;

      if (!isSupabaseConfigured) {
        const now = new Date().toISOString();
        const product: Product = {
          id: crypto.randomUUID(),
          store_id: storeId,
          name: values.name,
          sku: values.sku,
          quantity: values.quantity,
          low_stock_threshold: values.lowStockThreshold,
          reordered: false,
          created_at: now,
          updated_at: now
        };

        setProducts((current) => {
          const next = [product, ...current];
          saveDemoProducts(storeId, next);
          return next;
        });
        notify({ title: 'Product added', description: `${product.name} is now tracked.`, variant: 'success' });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: storeId,
          name: values.name,
          sku: values.sku,
          quantity: values.quantity,
          low_stock_threshold: values.lowStockThreshold,
          reordered: false
        })
        .select('*')
        .single();

      if (error) {
        notify({ title: 'Product creation failed', description: error.message, variant: 'error' });
        throw error;
      }

      await supabase.from('inventory_logs').insert({
        product_id: data.id,
        profile_id: profileId,
        action: 'created',
        quantity_delta: values.quantity
      });

      setProducts((current) => [data, ...current]);
      notify({ title: 'Product added', description: `${data.name} is now tracked.`, variant: 'success' });
    },
    [notify, profileId, storeId]
  );

  const adjustStock = useCallback(
    async (product: Product, quantityDelta: number) => {
      if (!profileId) return;

      const nextQuantity = Math.max(0, product.quantity + quantityDelta);
      if (!isSupabaseConfigured) {
        const updatedProduct: Product = {
          ...product,
          quantity: nextQuantity,
          reordered: nextQuantity > product.low_stock_threshold ? false : product.reordered,
          updated_at: new Date().toISOString()
        };

        setProducts((current) => {
          const next = current.map((item) => (item.id === product.id ? updatedProduct : item));
          saveDemoProducts(product.store_id, next);
          return next;
        });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          quantity: nextQuantity,
          reordered: nextQuantity > product.low_stock_threshold ? false : product.reordered,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select('*')
        .single();

      if (error) {
        notify({ title: 'Stock update failed', description: error.message, variant: 'error' });
        throw error;
      }

      const actualDelta = nextQuantity - product.quantity;
      await supabase.from('inventory_logs').insert({
        product_id: product.id,
        profile_id: profileId,
        action: actualDelta >= 0 ? 'increase' : 'decrease',
        quantity_delta: actualDelta
      });

      setProducts((current) => current.map((item) => (item.id === data.id ? data : item)));
    },
    [notify, profileId]
  );

  const markReordered = useCallback(
    async (product: Product) => {
      if (!profileId) return;

      if (!isSupabaseConfigured) {
        const updatedProduct: Product = {
          ...product,
          reordered: true,
          updated_at: new Date().toISOString()
        };

        setProducts((current) => {
          const next = current.map((item) => (item.id === product.id ? updatedProduct : item));
          saveDemoProducts(product.store_id, next);
          return next;
        });
        notify({ title: 'Marked reordered', description: `${product.name} has been flagged.`, variant: 'success' });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .update({ reordered: true, updated_at: new Date().toISOString() })
        .eq('id', product.id)
        .select('*')
        .single();

      if (error) {
        notify({ title: 'Reorder update failed', description: error.message, variant: 'error' });
        throw error;
      }

      await supabase.from('inventory_logs').insert({
        product_id: product.id,
        profile_id: profileId,
        action: 'reordered',
        quantity_delta: 0
      });

      setProducts((current) => current.map((item) => (item.id === data.id ? data : item)));
      notify({ title: 'Marked reordered', description: `${data.name} has been flagged.`, variant: 'success' });
    },
    [notify, profileId]
  );

  return {
    products,
    filteredProducts,
    loading,
    filters,
    stockProgress,
    setFilters,
    addProduct,
    adjustStock,
    markReordered,
    refresh: loadProducts
  };
}
