import { Database, KeyRound } from 'lucide-react';

export function SupabaseSetup() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-2xl rounded-md border border-border bg-card p-6 text-card-foreground shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Supabase environment is missing</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your Supabase project URL and anon key before using authentication and inventory data.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4" />
            Create a file named .env in the project root
          </div>
          <pre className="mt-3 overflow-x-auto rounded-md bg-background p-4 text-sm">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          After saving `.env`, restart the dev server with `npm run dev`. Also run
          `supabase/schema.sql` in the Supabase SQL Editor to create the required tables and RLS
          policies.
        </p>
      </section>
    </main>
  );
}
