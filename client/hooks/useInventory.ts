import { useState, useCallback, useEffect } from "react";

export interface ItemTag {
  id: string;
  name: string;
  value?: string;
  type: "type" | "importance" | "price" | "custom";
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  location: string;
  tags: ItemTag[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
}

const STORAGE_KEY = "stowage_inventory";

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setItems(items);
      } catch (error) {
        console.error("Failed to parse inventory from localStorage", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
      const newItem: InventoryItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    },
    []
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<InventoryItem, "id" | "createdAt">>) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        )
      );
    },
    []
  );

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getFilteredItems = useCallback(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags.some(
          (tag) =>
            tag.name.toLowerCase().includes(query) ||
            tag.value?.toLowerCase().includes(query)
        )
    );
  }, [items, searchQuery]);

  const getItemsByLocation = useCallback(
    (location: string) => {
      return items.filter((item) => item.location === location);
    },
    [items]
  );

  const getItemsByTag = useCallback(
    (tagId: string) => {
      return items.filter((item) => item.tags.some((tag) => tag.id === tagId));
    },
    [items]
  );

  const getTotalValue = useCallback(() => {
    return items.reduce((total, item) => {
      const priceTag = item.tags.find((t) => t.type === "price");
      const price = priceTag?.value ? parseFloat(priceTag.value) : 0;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stowage-inventory-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const importData = useCallback((jsonData: InventoryItem[]) => {
    try {
      const items = jsonData.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
      setItems(items);
      return true;
    } catch (error) {
      console.error("Failed to import data", error);
      return false;
    }
  }, []);

  return {
    items,
    searchQuery,
    setSearchQuery,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    getFilteredItems,
    getItemsByLocation,
    getItemsByTag,
    getTotalValue,
    exportData,
    importData,
  };
};
