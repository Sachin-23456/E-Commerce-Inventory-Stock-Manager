create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'warehouse_manager'
    check (role in ('warehouse_manager', 'staff', 'admin')),
  store_id uuid not null,
  store_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  name text not null,
  sku text not null,
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold > 0),
  reordered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, sku)
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('increase', 'decrease', 'reordered', 'created')),
  quantity_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.inventory_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own manager profile" on public.profiles;
create policy "Users can insert own manager profile"
on public.profiles for insert
with check (auth.uid() = id and role in ('warehouse_manager', 'admin'));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Managers can read products for their store" on public.products;
create policy "Managers can read products for their store"
on public.products for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.store_id = products.store_id
      and p.role in ('warehouse_manager', 'admin')
  )
);

drop policy if exists "Managers can insert products for their store" on public.products;
create policy "Managers can insert products for their store"
on public.products for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.store_id = products.store_id
      and p.role in ('warehouse_manager', 'admin')
  )
);

drop policy if exists "Managers can update products for their store" on public.products;
create policy "Managers can update products for their store"
on public.products for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.store_id = products.store_id
      and p.role in ('warehouse_manager', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.store_id = products.store_id
      and p.role in ('warehouse_manager', 'admin')
  )
);

drop policy if exists "Managers can create inventory logs for their store" on public.inventory_logs;
create policy "Managers can create inventory logs for their store"
on public.inventory_logs for insert
with check (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.products item
    join public.profiles p on p.store_id = item.store_id
    where item.id = inventory_logs.product_id
      and p.id = auth.uid()
      and p.role in ('warehouse_manager', 'admin')
  )
);

drop policy if exists "Managers can read inventory logs for their store" on public.inventory_logs;
create policy "Managers can read inventory logs for their store"
on public.inventory_logs for select
using (
  exists (
    select 1
    from public.products item
    join public.profiles p on p.store_id = item.store_id
    where item.id = inventory_logs.product_id
      and p.id = auth.uid()
      and p.role in ('warehouse_manager', 'admin')
  )
);
