import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface StorageLocation {
  id: string;
  name: string;
  type: 'drawer' | 'bag' | 'room' | 'cabinet' | 'shelf' | 'other';
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'stowage_locations_cache';

export const useSupabaseStorage = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
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
        const locations = parsed.map((loc: any) => ({
          ...loc,
          createdAt: new Date(loc.createdAt),
          updatedAt: new Date(loc.updatedAt),
        }));
        setLocations(locations);
      } catch (err) {
        console.error('Failed to load cached locations', err);
      }
    }
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setLocations([]);
      setIsLoaded(true);
      return;
    }

    const fetchLocations = async () => {
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from('storage_locations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const processedLocations = (data || []).map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          type: loc.type,
          description: loc.description,
          color: loc.color,
          icon: loc.icon,
          parentId: loc.parent_id,
          createdAt: new Date(loc.created_at),
          updatedAt: new Date(loc.updated_at),
        }));

        setLocations(processedLocations);
        
        // Cache locally
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processedLocations));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch locations';
        setError(message);
        console.error('Fetch locations error:', err);
      } finally {
        setIsSyncing(false);
        setIsLoaded(true);
      }
    };

    fetchLocations();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`storage:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'storage_locations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchLocations(); // Refetch on changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addLocation = useCallback(
    async (location: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) {
        setError('Not authenticated');
        return null;
      }

      try {
        setIsSyncing(true);

        const { data, error: insertError } = await supabase
          .from('storage_locations')
          .insert({
            user_id: user.id,
            name: location.name,
            type: location.type,
            description: location.description,
            color: location.color,
            icon: location.icon,
            parent_id: location.parentId,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'location_created',
          entity_type: 'storage_location',
          entity_id: data.id,
        });

        setError(null);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add location';
        setError(message);
        console.error('Add location error:', err);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const updateLocation = useCallback(
    async (
      id: string,
      updates: Partial<Omit<StorageLocation, 'id' | 'createdAt'>>
    ) => {
      if (!user) {
        setError('Not authenticated');
        return;
      }

      try {
        setIsSyncing(true);

        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.type) updateData.type = updates.type;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.color) updateData.color = updates.color;
        if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;

        const { error: updateError } = await supabase
          .from('storage_locations')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'location_updated',
          entity_type: 'storage_location',
          entity_id: id,
          changes: updateData,
        });

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update location';
        setError(message);
        console.error('Update location error:', err);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      if (!user) {
        setError('Not authenticated');
        return;
      }

      try {
        setIsSyncing(true);

        const { error: deleteError } = await supabase
          .from('storage_locations')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'location_deleted',
          entity_type: 'storage_location',
          entity_id: id,
        });

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete location';
        setError(message);
        console.error('Delete location error:', err);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const getFilteredLocations = useCallback(() => {
    if (!searchQuery) return locations;
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.type.toLowerCase().includes(query) ||
        location.description?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  const getLocationsByType = useCallback(
    (type: StorageLocation['type']) => {
      return locations.filter((location) => location.type === type);
    },
    [locations]
  );

  const getChildLocations = useCallback(
    (parentId: string) => {
      return locations.filter((location) => location.parentId === parentId);
    },
    [locations]
  );

  const getParentLocation = useCallback(
    (parentId: string | undefined | null) => {
      if (!parentId) return null;
      return locations.find((location) => location.id === parentId) || null;
    },
    [locations]
  );

  const getLocationPath = useCallback(
    (locationId: string): string => {
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) return '';

      const pathParts: string[] = [location.name];
      let currentParentId = location.parentId;

      while (currentParentId) {
        const parent = locations.find((loc) => loc.id === currentParentId);
        if (!parent) break;
        pathParts.unshift(parent.name);
        currentParentId = parent.parentId;
      }

      return pathParts.join(' > ');
    },
    [locations]
  );

  const getRootLocations = useCallback(
    () => {
      return locations.filter((location) => !location.parentId);
    },
    [locations]
  );

  return {
    locations,
    searchQuery,
    setSearchQuery,
    isLoaded,
    isSyncing,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    getFilteredLocations,
    getLocationsByType,
    getChildLocations,
    getParentLocation,
    getLocationPath,
    getRootLocations,
  };
};
