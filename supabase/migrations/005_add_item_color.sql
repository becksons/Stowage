-- Add color column to inventory_items table
-- This allows items to have custom colors for display and icon coloring

ALTER TABLE public.inventory_items 
ADD COLUMN color VARCHAR(7) DEFAULT '#6366f1';

-- Create index for potential color-based filtering
CREATE INDEX idx_inventory_items_color 
ON public.inventory_items(user_id, color);
