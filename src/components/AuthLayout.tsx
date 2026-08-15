import { Boxes } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerHref,
  children
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_440px]">
      <section className="hidden bg-[linear-gradient(135deg,hsl(188_78%_31%),hsl(151_58%_37%))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white/15">
            <Boxes className="h-5 w-5" />
          </span>
          Inventory Stock Manager
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            Store operations
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">
            Keep warehouse stock clean, searchable, and accountable.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Managers can track product health, record stock movements, and keep every action tied to
            an authenticated profile.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <Boxes className="h-5 w-5" />
              </span>
              Inventory Stock Manager
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-6 shadow-soft">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {footerText}{' '}
            <Link className="font-semibold text-primary hover:underline" to={footerHref}>
              {footerLinkText}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
