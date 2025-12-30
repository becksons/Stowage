-- Make location_id nullable to support items placed inside other items (storage containers)
-- When an item is placed inside another item, location_id will be NULL and location_name will contain the container item name

ALTER TABLE public.inventory_items 
ALTER COLUMN location_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL values
ALTER TABLE public.inventory_items
DROP CONSTRAINT inventory_items_location_id_fkey,
ADD CONSTRAINT inventory_items_location_id_fkey 
FOREIGN KEY (location_id) REFERENCES public.storage_locations(id) ON DELETE SET NULL;
