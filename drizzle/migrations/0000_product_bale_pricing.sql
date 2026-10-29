ALTER TABLE public.products ADD COLUMN cost_per_bale numeric NOT NULL DEFAULT 0, ADD COLUMN units_per_bale integer NOT NULL DEFAULT 1, ADD COLUMN stock_tracked boolean NOT NULL DEFAULT true;
UPDATE public.products SET cost_per_bale = cost;
ALTER TABLE public.products ADD CONSTRAINT products_bale_cost_nonnegative CHECK (cost_per_bale >= 0), ADD CONSTRAINT products_bale_units_positive CHECK (units_per_bale > 0);
COMMENT ON COLUMN public.products.stock IS 'Inventory in individual units; displayed as bales using units_per_bale. Ignored when stock_tracked is false.';
COMMENT ON COLUMN public.products.cost IS 'Unit cost derived from cost_per_bale / units_per_bale; retained for sales and dashboard compatibility.';
COMMENT ON COLUMN public.products.sku IS 'Legacy SKU retained for compatibility; no longer collected in the product form.';
COMMENT ON COLUMN public.products.min_stock IS 'Legacy minimum-stock threshold retained for existing stock alerts; no longer collected in product forms.';