import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const adjustmentSchema = z.object({
  amount: z.coerce.number().int().min(1, 'Use at least 1 unit.').max(9999, 'Use a smaller adjustment.')
});

type AdjustmentValues = z.infer<typeof adjustmentSchema>;

type StockAdjustmentFormProps = {
  onAdjust: (delta: number) => Promise<void>;
};

export function StockAdjustmentForm({ onAdjust }: StockAdjustmentFormProps) {
  const {
    register,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<AdjustmentValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { amount: 1 }
  });

  async function submit(direction: 1 | -1) {
    const parsed = adjustmentSchema.safeParse({ amount: getValues('amount') });
    if (!parsed.success) return;
    await onAdjust(parsed.data.amount * direction);
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <div className="flex items-center gap-2">
        <input
          aria-label="Stock adjustment quantity"
          className="input w-24 text-center font-bold"
          type="number"
          min="1"
          {...register('amount')}
        />
        <button
          type="button"
          className="btn-secondary h-11 w-11 px-0"
          onClick={() => void submit(-1)}
          disabled={isSubmitting}
          aria-label="Decrease stock"
          title="Decrease stock"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="btn-secondary h-11 w-11 px-0"
          onClick={() => void submit(1)}
          disabled={isSubmitting}
          aria-label="Increase stock"
          title="Increase stock"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {errors.amount ? <p className="error-text">{errors.amount.message}</p> : null}
    </div>
  );
}
