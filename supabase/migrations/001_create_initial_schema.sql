-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'family', 'business')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create storage_locations table
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('drawer', 'bag', 'room', 'cabinet', 'shelf', 'other')),
  description TEXT,
  color VARCHAR(255) DEFAULT 'bg-blue-100 dark:bg-blue-950',
  parent_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT parent_not_self CHECK (parent_id IS NULL OR parent_id != id),
  CONSTRAINT unique_location_per_user UNIQUE (user_id, name, parent_id)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_id UUID NOT NULL REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  location_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create item_tags table
CREATE TABLE IF NOT EXISTS public.item_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value VARCHAR(255),
  type VARCHAR(50) NOT NULL CHECK (type IN ('price', 'type', 'importance', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create item_photos table (for future use)
CREATE TABLE IF NOT EXISTS public.item_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create shared_inventories table (for family sharing)
CREATE TABLE IF NOT EXISTS public.shared_inventories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT no_self_share CHECK (owner_id != shared_with_user_id),
  CONSTRAINT unique_share UNIQUE (owner_id, shared_with_user_id)
);

-- Create activity_log table (for tracking changes)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item_photos', 'item_photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_locations_user_id ON public.storage_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_parent_id ON public.storage_locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON public.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON public.inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON public.item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_photos_item_id ON public.item_photos(item_id);
CREATE INDEX IF NOT EXISTS idx_shared_inventories_owner_id ON public.shared_inventories(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_inventories_user_id ON public.shared_inventories(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can only see their own profile)
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Storage locations policies
CREATE POLICY "Users can view their own storage locations"
  ON public.storage_locations
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM public.shared_inventories
      WHERE shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own storage locations"
  ON public.storage_locations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own storage locations"
  ON public.storage_locations
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own storage locations"
  ON public.storage_locations
  FOR DELETE
  USING (user_id = auth.uid());

-- Inventory items policies
CREATE POLICY "Users can view their own items"
  ON public.inventory_items
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM public.shared_inventories
      WHERE shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own items"
  ON public.inventory_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own items"
  ON public.inventory_items
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own items"
  ON public.inventory_items
  FOR DELETE
  USING (user_id = auth.uid());

-- Item tags policies (inherited from items)
CREATE POLICY "Users can view item tags"
  ON public.item_tags
  FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM public.inventory_items
      WHERE user_id = auth.uid()
      OR user_id IN (
        SELECT owner_id FROM public.shared_inventories
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage item tags"
  ON public.item_tags
  FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM public.inventory_items
      WHERE user_id = auth.uid()
    )
  );

-- Activity log policies
CREATE POLICY "Users can view their own activity"
  ON public.activity_log
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activity"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Shared inventories policies
CREATE POLICY "Users can view shared with them"
  ON public.shared_inventories
  FOR SELECT
  USING (owner_id = auth.uid() OR shared_with_user_id = auth.uid());

CREATE POLICY "Users can create shares of their inventory"
  ON public.shared_inventories
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
