import { useState, useCallback, useEffect } from "react";

export interface StorageLocation {
  id: string;
  name: string;
  type: "drawer" | "bag" | "room" | "cabinet" | "shelf" | "other";
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "stowage_storage";

const DEFAULT_LOCATIONS: Omit<StorageLocation, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Bedroom Drawer",
    type: "drawer",
    description: "Main bedroom dresser",
    color: "bg-blue-100 dark:bg-blue-950",
    icon: "🗂️",
  },
  {
    name: "Kitchen Cabinet",
    type: "cabinet",
    description: "Upper kitchen cabinets",
    color: "bg-green-100 dark:bg-green-950",
    icon: "🗄️",
  },
];

export const useStorage = () => {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const locs = parsed.map((loc: any) => ({
          ...loc,
          createdAt: new Date(loc.createdAt),
          updatedAt: new Date(loc.updatedAt),
        }));
        setLocations(locs);
      } catch (error) {
        console.error("Failed to parse storage from localStorage", error);
        // Initialize with defaults
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
    setIsLoaded(true);
  }, []);

  const initializeDefaults = () => {
    const defaultLocs = DEFAULT_LOCATIONS.map((loc) => ({
      ...loc,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setLocations(defaultLocs);
  };

  // Save to localStorage whenever locations change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    }
  }, [locations, isLoaded]);

  const addLocation = useCallback(
    (
      location: Omit<StorageLocation, "id" | "createdAt" | "updatedAt">
    ) => {
      const newLocation: StorageLocation = {
        ...location,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLocations((prev) => [newLocation, ...prev]);
      return newLocation;
    },
    []
  );

  const updateLocation = useCallback(
    (
      id: string,
      updates: Partial<Omit<StorageLocation, "id" | "createdAt">>
    ) => {
      setLocations((prev) =>
        prev.map((location) =>
          location.id === id
            ? { ...location, ...updates, updatedAt: new Date() }
            : location
        )
      );
    },
    []
  );

  const deleteLocation = useCallback((id: string) => {
    setLocations((prev) => prev.filter((location) => location.id !== id));
  }, []);

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
    (type: StorageLocation["type"]) => {
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
      if (!location) return "";

      const pathParts: string[] = [location.name];
      let currentParentId = location.parentId;

      while (currentParentId) {
        const parent = locations.find((loc) => loc.id === currentParentId);
        if (!parent) break;
        pathParts.unshift(parent.name);
        currentParentId = parent.parentId;
      }

      return pathParts.join(" > ");
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
