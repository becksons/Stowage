-- Add is_storage_item column to inventory_items table
-- This allows items to be marked as storage/containers

ALTER TABLE public.inventory_items 
ADD COLUMN is_storage_item boolean DEFAULT false;

-- Create index for filtering storage items
CREATE INDEX idx_inventory_items_is_storage_item 
ON public.inventory_items(user_id, is_storage_item);
