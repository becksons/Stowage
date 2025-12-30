-- Add icon column to inventory_items table
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS icon VARCHAR(255);

-- Add icon column to storage_locations table
ALTER TABLE public.storage_locations
ADD COLUMN IF NOT EXISTS icon VARCHAR(255);

-- Create indexes for icon columns
CREATE INDEX IF NOT EXISTS idx_inventory_items_icon ON public.inventory_items(icon);
CREATE INDEX IF NOT EXISTS idx_storage_locations_icon ON public.storage_locations(icon);
