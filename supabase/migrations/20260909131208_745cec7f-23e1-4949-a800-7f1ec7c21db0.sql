-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  sku text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own products" ON public.products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX products_user_idx ON public.products(user_id);

-- STOCK MOVEMENTS
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  sku text NOT NULL DEFAULT '',
  type text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  resulting_stock integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stock movements" ON public.stock_movements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX stock_movements_user_idx ON public.stock_movements(user_id);

-- SALES
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  customer text NOT NULL DEFAULT 'Consumidor final',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'Dinheiro',
  status text NOT NULL DEFAULT 'Concluída',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sales" ON public.sales FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER sales_set_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX sales_user_idx ON public.sales(user_id);

-- CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Pessoa física',
  document text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON public.customers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX customers_user_idx ON public.customers(user_id);

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  document text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  categories text[] NOT NULL DEFAULT '{}',
  payment_terms text NOT NULL DEFAULT '',
  lead_time_days integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ativo',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own suppliers" ON public.suppliers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER suppliers_set_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX suppliers_user_idx ON public.suppliers(user_id);

-- FINANCE ENTRIES
CREATE TABLE public.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  category text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  due_date timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'Pendente',
  method text NOT NULL DEFAULT '',
  counterparty text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own finance entries" ON public.finance_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER finance_entries_set_updated_at BEFORE UPDATE ON public.finance_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX finance_entries_user_idx ON public.finance_entries(user_id);

-- USER SETTINGS
CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY,
  company jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_settings_set_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();