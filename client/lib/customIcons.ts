/**
 * Custom Icons Utility
 * Maps item/storage types to custom SVG icon paths
 * Icons should be placed in: public/icons/items/ and public/icons/storage/
 */

export const itemIcons: Record<string, string> = {
  // Item icons - normalized names to SVG paths
  // Container icons (can be used for storage items marked as containers)
  "backpack": "/icons/storage/Backpack.svg",
  "audio wave": "/icons/items/Audio Wave.svg",
  "bag": "/icons/items/Bag.svg",
  "ball point pen": "/icons/items/Ball Point Pen.svg",
  "bicycle helmet": "/icons/items/Bicycle Helmet.svg",
  "bicycle": "/icons/items/Bicycle.svg",
  "bracelet": "/icons/items/Bracelet.svg",
  "broom": "/icons/items/Broom.svg",
  "charging battery": "/icons/items/Charging Battery.svg",
  "cleaning supply": "/icons/items/Cleaning Supply.svg",
  "cloth": "/icons/items/Cloth.svg",
  "console": "/icons/items/Console.svg",
  "diamond ring": "/icons/items/Diamond Ring.svg",
  "document": "/icons/items/Document.svg",
  "drill": "/icons/items/Drill.svg",
  "earrings": "/icons/items/Earrings.svg",
  "empty bed": "/icons/items/Empty Bed.svg",
  "eraser": "/icons/items/Eraser.svg",
  "game controller": "/icons/items/Game Controller.svg",
  "guitar pick": "/icons/items/Guitar Pick.svg",
  "guitar": "/icons/items/Guitar.svg",
  "hair brush": "/icons/items/Hair Brush.svg",
  "hair dryer": "/icons/items/Hair Dryer.svg",
  "hammer": "/icons/items/Hammer.svg",
  "headphones": "/icons/items/Headphones.svg",
  "heels": "/icons/items/Heels.svg",
  "jacket": "/icons/items/Jacket.svg",
  "jeans": "/icons/items/Jeans.svg",
  "jewelry": "/icons/items/Jewelry.svg",
  "jumper": "/icons/items/Jumper.svg",
  "keyboard": "/icons/items/Keyboard.svg",
  "lamp": "/icons/items/Lamp.svg",
  "laptop": "/icons/items/Laptop.svg",
  "lighter": "/icons/items/Lighter.svg",
  "mens underwear": "/icons/items/Mens Underwear.svg",
  "moleskine": "/icons/items/Moleskine.svg",
  "monitor": "/icons/items/Monitor.svg",
  "music record": "/icons/items/Music Record.svg",
  "nail": "/icons/items/Nail.svg",
  "network cable": "/icons/items/Network Cable.svg",
  "office chair": "/icons/items/Office Chair.svg",
  "pajama pants": "/icons/items/Pajama Pants.svg",
  "pedal": "/icons/items/Pedal.svg",
  "pencil": "/icons/items/Pencil.svg",
  "perfume": "/icons/items/Perfume.svg",
  "phone case": "/icons/items/Phone Case.svg",
  "pillow": "/icons/items/Pillow.svg",
  "print": "/icons/items/Print.svg",
  "processor": "/icons/items/Processor.svg",
  "robe": "/icons/items/Robe.svg",
  "roller skates": "/icons/items/Roller Skates.svg",
  "rubber boots": "/icons/items/Rubber Boots.svg",
  "rubber gloves": "/icons/items/Rubber Gloves.svg",
  "rug": "/icons/items/Rug.svg",
  "sandals": "/icons/items/Sandals.svg",
  "scissors": "/icons/items/Scissors.svg",
  "screwdriver": "/icons/items/Screwdriver.svg",
  "shampoo": "/icons/items/Shampoo.svg",
  "shirt": "/icons/items/Shirt.svg",
  "shoes": "/icons/items/Shoes.svg",
  "shorts": "/icons/items/Shorts.svg",
  "skateboard": "/icons/items/Skateboard.svg",
  "socks": "/icons/items/Socks.svg",
  "spade": "/icons/items/Spade.svg",
  "suit": "/icons/items/Suit.svg",
  "suitcase": "/icons/items/Suitcase.svg",
  "swim shorts": "/icons/items/SwimShorts.svg",
  "table": "/icons/items/Table.svg",
  "toilet paper": "/icons/items/Toilet Paper.svg",
  "tools": "/icons/items/Tools.svg",
  "toothbrush": "/icons/items/Toothbrush.svg",
  "toothpaste": "/icons/items/Toothpaste.svg",
  "towel": "/icons/items/Towel.svg",
  "tray": "/icons/items/Tray.svg",
  "trousers": "/icons/items/Trousers.svg",
  "tube": "/icons/items/Tube.svg",
  "usb memory stick": "/icons/items/USB Memory Stick.svg",
  "underwear": "/icons/items/Underwear.svg",
  "vape": "/icons/items/Vape.svg",
  "watches clasp": "/icons/items/Watches Clasp.svg",
  "wi-fi router": "/icons/items/Wi-Fi Router.svg",
  "wrench": "/icons/items/Wrench.svg",

  // Default fallback
  "default": "/icons/items/default.svg",
};

export const storageIcons: Record<string, string> = {
  // Storage location icons - type to SVG paths
  "backpack": "/icons/storage/Backpack.svg",
  "bag": "/icons/storage/Bag.svg",
  "box": "/icons/storage/Box.svg",
  "cabinet": "/icons/storage/Cabinet.svg",
  "closet": "/icons/storage/Closet.svg",
  "docstack": "/icons/storage/DocStack.svg",
  "drawer": "/icons/storage/Drawer.svg",
  "kit": "/icons/storage/Kit.svg",
  "room": "/icons/storage/Room.svg",
  "toolbox": "/icons/storage/Toolbox.svg",
  "tray": "/icons/storage/Tray.svg",

  // Default fallback
  "default": "/icons/storage/default.svg",
};

/**
 * Get custom icon path for an item
 * @param itemIcon - Icon name/type of the item
 * @returns Path to the SVG icon
 */
export const getItemIconPath = (itemIcon?: string): string => {
  if (!itemIcon) return itemIcons.default;
  
  const normalized = itemIcon.toLowerCase();
  return itemIcons[normalized] || itemIcons.default;
};

/**
 * Get custom icon path for storage
 * @param storageIcon - Icon type/name of storage
 * @returns Path to the SVG icon
 */
export const getStorageIconPath = (storageIcon?: string): string => {
  if (!storageIcon) return storageIcons.default;
  
  return storageIcons[storageIcon.toLowerCase()] || storageIcons.default;
};

/**
 * Get all available item icon options
 * @returns Array of available item icon names (excluding 'default')
 */
export const getItemIconOptions = (): string[] => {
  return Object.keys(itemIcons)
    .filter(key => key !== "default")
    .sort();
};

/**
 * Get all available storage icon options
 * @returns Array of available storage icon names (excluding 'default')
 */
export const getStorageIconOptions = (): string[] => {
  return Object.keys(storageIcons)
    .filter(key => key !== "default")
    .sort();
};
