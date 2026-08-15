import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

function Root({ children }: { children: ReactNode }) {
  return (
    <article className="panel p-5 text-card-foreground transition duration-200 hover:-translate-y-1 hover:shadow-panel">
      {children}
    </article>
  );
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-start justify-between gap-4', className)}>{children}</div>;
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-5 flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

export const InventoryCard = Object.assign(Root, {
  Header,
  Body,
  Actions
});
