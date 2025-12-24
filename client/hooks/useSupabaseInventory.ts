import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface ItemTag {
  id: string;
  name: string;
  value?: string;
  type: 'price' | 'type' | 'importance' | 'custom';
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  location: string;
  location_id: string;
  quantity: number;
  icon?: string;
  tags: ItemTag[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'stowage_inventory_cache';

export const useSupabaseInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const items = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setItems(items);
      } catch (err) {
        console.error('Failed to load cached inventory', err);
      }
    }
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoaded(true);
      return;
    }

    const fetchItems = async () => {
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*, item_tags(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const processedItems = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          location: item.location_name,
          location_id: item.location_id,
          quantity: item.quantity,
          icon: item.icon,
          tags: item.item_tags || [],
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }));

        setItems(processedItems);
        
        // Cache locally
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processedItems));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch items';
        setError(message);
        console.error('Fetch inventory error:', err);
      } finally {
        setIsSyncing(false);
        setIsLoaded(true);
      }
    };

    fetchItems();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`inventory:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchItems(); // Refetch on changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addItem = useCallback(
    async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) {
        setError('Not authenticated');
        return null;
      }

      try {
        setIsSyncing(true);

        // Insert item
        const { data: itemData, error: itemError } = await supabase
          .from('inventory_items')
          .insert({
            user_id: user.id,
            name: item.name,
            description: item.description,
            location_id: item.location_id,
            location_name: item.location,
            quantity: item.quantity,
            icon: item.icon,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Insert tags if any
        if (item.tags && item.tags.length > 0) {
          const { error: tagsError } = await supabase
            .from('item_tags')
            .insert(
              item.tags.map((tag) => ({
                item_id: itemData.id,
                name: tag.name,
                value: tag.value,
                type: tag.type,
              }))
            );

          if (tagsError) throw tagsError;
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'item_created',
          entity_type: 'inventory_item',
          entity_id: itemData.id,
        });

        setError(null);
        return itemData;
      } catch (err) {
        let message = 'Failed to add item';

        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === 'object' && err !== null) {
          message = JSON.stringify(err);
        } else if (typeof err === 'string') {
          message = err;
        }

        setError(message);
        console.error('Add item error details:', {
          error: err,
          message: message,
          item: item,
        });
        throw new Error(message);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (!user) {
        setError('Not authenticated');
        return;
      }

      try {
        setIsSyncing(true);

        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.description) updateData.description = updates.description;
        if (updates.location) updateData.location_name = updates.location;
        if (updates.location_id) updateData.location_id = updates.location_id;
        if (updates.quantity) updateData.quantity = updates.quantity;
        if (updates.icon !== undefined) updateData.icon = updates.icon;

        const { error: updateError } = await supabase
          .from('inventory_items')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Update tags if provided
        if (updates.tags) {
          await supabase.from('item_tags').delete().eq('item_id', id);

          if (updates.tags.length > 0) {
            const { error: tagsError } = await supabase
              .from('item_tags')
              .insert(
                updates.tags.map((tag) => ({
                  item_id: id,
                  name: tag.name,
                  value: tag.value,
                  type: tag.type,
                }))
              );

            if (tagsError) throw tagsError;
          }
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'item_updated',
          entity_type: 'inventory_item',
          entity_id: id,
          changes: updateData,
        });

        setError(null);
      } catch (err) {
        let message = 'Failed to update item';

        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === 'object' && err !== null) {
          message = JSON.stringify(err);
        } else if (typeof err === 'string') {
          message = err;
        }

        setError(message);
        console.error('Update item error details:', {
          error: err,
          message: message,
          updates: updates,
        });
        throw new Error(message);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!user) {
        setError('Not authenticated');
        return;
      }

      try {
        setIsSyncing(true);

        const { error: deleteError } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'item_deleted',
          entity_type: 'inventory_item',
          entity_id: id,
        });

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete item';
        setError(message);
        console.error('Delete item error:', err);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const getFilteredItems = useCallback(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const getTotalValue = useCallback(() => {
    return items.reduce((total, item) => {
      const priceTag = item.tags.find((tag) => tag.type === 'price');
      if (priceTag && priceTag.value) {
        return total + parseFloat(priceTag.value) * item.quantity;
      }
      return total;
    }, 0);
  }, [items]);

  return {
    items,
    searchQuery,
    setSearchQuery,
    isLoaded,
    isSyncing,
    error,
    addItem,
    updateItem,
    deleteItem,
    getFilteredItems,
    getTotalValue,
    getItemsByLocation: (location: string) => items.filter((item) => item.location === location),
  };
};
