/**
 * Custom Icons Utility
 * Maps item/storage types to custom SVG icon paths
 * Icons should be placed in: public/icons/items/ and public/icons/storage/
 */

export const itemIcons: Record<string, string> = {
  // Currently available
  backpack: "/icons/items/backpack.svg",

  // Add your item icons here as you upload them
  // Format: icon_name: "/icons/items/icon_name.svg"
  // Example entries (add yours below):
  // jacket: "/icons/items/jacket.svg",
  // watch: "/icons/items/watch.svg",
  // shoes: "/icons/items/shoes.svg",
  // laptop: "/icons/items/laptop.svg",

  // Default fallback
  default: "/icons/items/default.svg",
};

export const storageIcons: Record<string, string> = {
  // Currently available (matches storageTypes from Storage.tsx)
  drawer: "/icons/storage/drawer.svg",

  // Add your storage icons here as you upload them
  // Format: storage_type: "/icons/storage/storage_type.svg"
  // Example entries (add yours below):
  // bag: "/icons/storage/bag.svg",
  // room: "/icons/storage/room.svg",
  // cabinet: "/icons/storage/cabinet.svg",
  // shelf: "/icons/storage/shelf.svg",
  // other: "/icons/storage/other.svg",

  // Default fallback
  default: "/icons/storage/default.svg",
};

/**
 * Get custom icon path for an item
 * @param itemName - Name/type of the item
 * @returns Path to the SVG icon
 */
export const getItemIconPath = (itemName?: string): string => {
  if (!itemName) return itemIcons.default;
  
  const normalized = itemName.toLowerCase().replace(/\s+/g, "_");
  return itemIcons[normalized] || itemIcons.default;
};

/**
 * Get custom icon path for storage
 * @param storageType - Type of storage (drawer, bag, room, etc)
 * @returns Path to the SVG icon
 */
export const getStorageIconPath = (storageType?: string): string => {
  if (!storageType) return storageIcons.default;
  
  return storageIcons[storageType.toLowerCase()] || storageIcons.default;
};
