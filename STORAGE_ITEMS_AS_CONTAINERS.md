# Storage Items as Containers Feature

## Overview
This feature allows items to be converted into storage containers, which can then hold other items inside them. For example, you could make a "Backpack" item into a storage container and put a "Passport", "Phone", etc. inside it.

## Database Changes Required

### Migration 4: Make location_id Nullable
**File:** `supabase/migrations/004_make_location_id_nullable.sql`

This migration makes the `location_id` column in `inventory_items` nullable. When an item is placed inside another item (storage container), the `location_id` will be NULL, and the `location_name` will contain the container item's name.

**To Apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/004_make_location_id_nullable.sql`
3. Paste and run the query
4. You should see a success message

## How It Works

### Creating a Storage Item
1. In the Inventory page, click "Add Item"
2. Fill in the item name, description, and icon
3. Check the box: **"Make this a storage container"**
4. Save the item
5. The item will now appear in the Storage page under "Items as Containers"

### Placing Items Inside a Storage Container
1. In Inventory, click "Add Item" or edit an existing item
2. In the "Storage Location" dropdown, you'll now see two sections:
   - **STORAGE LOCATIONS** - Physical rooms/drawers (📍 icon)
   - **CONTAINERS (ITEMS)** - Items marked as storage (📦 icon with item's icon preview)
3. Select a container item
4. Save the item
5. The item will now show inside the container

### Icons for Storage Containers
- When creating a storage item, select an icon from the "Item Icon" dropdown
- The icon will be displayed when the container is shown in the Storage page
- When selecting a container in the location dropdown, you'll see the container's icon next to its name

## Technical Details

### InventoryItem Interface
```typescript
interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  location: string;           // Could be a storage location name or container item name
  location_id: string | null; // NULL if inside a storage item container
  quantity: number;
  icon?: string;
  isStorageItem: boolean;     // TRUE if this item is a container
  tags: ItemTag[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Storage Locations vs Storage Items
- **Storage Locations**: Physical places (rooms, drawers, cabinets) - have `id` and `parent_id`
- **Storage Items**: Items converted to containers - have `isStorageItem = true`

### Location Resolution
When displaying an item's location:
1. If `location_id` is not null → it's in a storage location
2. If `location_id` is null → check `location_name` → it's inside a storage item container

## Code Changes

### Files Modified
1. **client/hooks/useSupabaseInventory.ts**
   - Updated `addItem()` to only send `is_storage_item` if true
   - Updated `updateItem()` to handle nullable `location_id`
   - Added `isStorageItem` field mapping

2. **client/components/AddEditItemDialog.tsx**
   - Added location selector groups (Storage Locations vs Containers)
   - Display storage item icons in location selector
   - Added explanation about icons in storage container checkbox

3. **client/pages/Inventory.tsx**
   - Added `storageItems` filtering
   - Updated location selector to include storage items
   - Pass storage items to dialog component

4. **client/pages/Storage.tsx**
   - Already supports displaying items in storage containers

### Files Created
1. **supabase/migrations/004_make_location_id_nullable.sql**
   - Makes `location_id` nullable in `inventory_items` table

## Testing Checklist

- [ ] Apply migration 004 to Supabase
- [ ] Create an item and mark it as "storage container"
- [ ] Item appears in Storage page under "Items as Containers"
- [ ] Create another item and select the container as location
- [ ] Item appears inside the container in Storage page
- [ ] Container icon is displayed in item location dropdown
- [ ] Can select multiple items into same container
- [ ] Can move items between containers
- [ ] Icons display correctly for all containers

## Future Enhancements

1. Nested containers (container inside another container)
2. Drag-and-drop to move items between containers
3. Container capacity/quantity tracking
4. Visual hierarchy display
5. Export containers with items list

## Troubleshooting

### "Could not find location_id" Error
- This means migration 004 hasn't been applied yet
- Apply the migration as described above

### Items not showing in containers
- Verify `location_id` is NULL for those items
- Verify `location_name` matches the container item name
- Check that container item has `is_storage_item = true`

### Icons not showing for containers
- Verify the item has an icon selected
- Check that the icon file exists in `public/icons/items/`
- Clear browser cache and refresh

## API Reference

### Add Item to Container
```typescript
await addItem({
  name: "Passport",
  location: "Backpack",        // Container item name
  location_id: null,           // Nullable for containers
  isStorageItem: false,
  quantity: 1,
  icon: "passport",
  tags: [],
});
```

### Create Storage Container
```typescript
await addItem({
  name: "Backpack",
  location: "Luggage Closet",
  location_id: "location-uuid",
  isStorageItem: true,         // Mark as container
  quantity: 1,
  icon: "backpack",
  tags: [],
});
```
