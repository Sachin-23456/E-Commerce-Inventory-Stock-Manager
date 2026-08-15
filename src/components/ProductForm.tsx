import { zodResolver } from '@hookform/resolvers/zod';
import { PackagePlus, ScanBarcode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required.'),
  sku: z.string().min(2, 'SKU is required.'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative.'),
  lowStockThreshold: z.coerce.number().int().min(1, 'Threshold must be at least 1.')
});

export type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

export function ProductForm({ onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      quantity: 0,
      lowStockThreshold: 5
    }
  });

  async function submit(values: ProductFormValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="panel overflow-hidden">
      <div className="border-b border-border bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0))] p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <PackagePlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black">Add Product</h2>
            <p className="text-sm text-muted-foreground">Create a tracked SKU for this store.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="label">Product name</span>
          <input className="input" placeholder="Wireless barcode scanner" {...register('name')} />
          {errors.name ? <p className="error-text">{errors.name.message}</p> : null}
        </label>

        <label className="space-y-2">
          <span className="label">SKU</span>
          <div className="relative">
            <ScanBarcode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="input pl-10" placeholder="SKU-1001" {...register('sku')} />
          </div>
          {errors.sku ? <p className="error-text">{errors.sku.message}</p> : null}
        </label>

        <label className="space-y-2">
          <span className="label">Quantity</span>
          <input className="input" type="number" min="0" {...register('quantity')} />
          {errors.quantity ? <p className="error-text">{errors.quantity.message}</p> : null}
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">Low stock threshold</span>
          <input className="input" type="number" min="1" {...register('lowStockThreshold')} />
          {errors.lowStockThreshold ? (
            <p className="error-text">{errors.lowStockThreshold.message}</p>
          ) : null}
        </label>
        <button type="submit" className="btn-primary mt-2 w-full sm:col-span-2" disabled={isSubmitting}>
          <PackagePlus className="h-4 w-4" />
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
