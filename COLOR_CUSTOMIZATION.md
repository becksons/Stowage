# Item Color Customization Feature

## Overview
This feature allows users to customize the color of items in their inventory. Each item now has a custom color that is applied to:
- The item icon background
- The item icon itself (with color filters)
- The location badge
- The quantity badge

## Database Changes

### Migration 5: Add Color Field
**File:** `supabase/migrations/005_add_item_color.sql`

This migration adds a `color` column to the `inventory_items` table:
- **Column Name:** `color`
- **Type:** `VARCHAR(7)` (hex color format, e.g., `#FF5733`)
- **Default Value:** `#6366f1` (Indigo - the default color)

**To Apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/005_add_item_color.sql`
3. Run the query
4. You should see a success message

**SQL:**
```sql
ALTER TABLE public.inventory_items 
ADD COLUMN color VARCHAR(7) DEFAULT '#6366f1';

CREATE INDEX idx_inventory_items_color 
ON public.inventory_items(user_id, color);
```

## How It Works

### Selecting a Color
1. Open the "Add New Item" or "Edit Item" dialog
2. Scroll to the "Item Color" section
3. You'll see three ways to choose a color:
   - **Color preview box:** Click to see the current color
   - **Color picker:** Click to open a color picker dialog
   - **Hex input:** Type a hex color code (e.g., `#FF5733`)

### Color Application
The selected color is applied to:
1. **Icon Background:** Translucent version of the color (15% opacity) with a border
2. **Icon Filter:** CSS filter applied to the SVG to blend with the color
3. **Location Badge:** Uses the item color for text and background
4. **Quantity Badge:** Uses the item color for text and background

## Color System

### Default Color
- **Hex:** `#6366f1`
- **Name:** Indigo
- **RGB:** (99, 102, 241)

### Color Utility Functions
Located in `client/lib/colorUtils.ts`:

- **`hexToRgb(hex)`**: Converts hex color to RGB object
- **`rgbToHex(r, g, b)`**: Converts RGB to hex color
- **`getIconColorFilter(hexColor)`**: Generates CSS filter for icon coloring
- **`getColorWithOpacity(hexColor, opacity)`**: Gets rgba color string
- **`getColorBorder(hexColor, opacity)`**: Gets rgba border color
- **`isDarkColor(hexColor)`**: Determines if color is dark or light

## Implementation Details

### Files Modified
1. **supabase/migrations/005_add_item_color.sql**
   - Added color column to inventory_items table

2. **client/hooks/useSupabaseInventory.ts**
   - Updated `InventoryItem` interface to include `color` field
   - Updated `processedItems` mapping to include color
   - Updated `addItem()` to send color to database
   - Updated `updateItem()` to handle color updates

3. **client/components/AddEditItemDialog.tsx**
   - Added `color` to form state
   - Added color picker UI with hex input
   - Updated form submission to include color

4. **client/pages/Inventory.tsx**
   - Imported color utility functions
   - Updated icon container styling to use item color
   - Updated location badge to use item color
   - Updated quantity badge to use item color
   - Applied color filters to icon images

5. **client/lib/colorUtils.ts** (NEW)
   - Utility functions for color operations

## Usage Examples

### Adding an Item with Custom Color
```typescript
await addItem({
  name: "Red Cup",
  description: "My favorite coffee cup",
  location: "Kitchen",
  location_id: "location-uuid",
  quantity: 1,
  icon: "cup",
  color: "#EF4444",  // Red
  isStorageItem: false,
  tags: [],
});
```

### Updating an Item's Color
```typescript
await updateItem("item-id", {
  color: "#3B82F6",  // Blue
});
```

## Color Recommendations

Here are some recommended hex colors for different item categories:

### Common Colors
- **Red:** `#EF4444`
- **Orange:** `#F97316`
- **Yellow:** `#EAB308`
- **Green:** `#22C55E`
- **Blue:** `#3B82F6`
- **Purple:** `#A855F7`
- **Pink:** `#EC4899`
- **Indigo:** `#6366F1` (default)

### Category-Specific
- **Clothing:** `#EC4899` (Pink)
- **Electronics:** `#3B82F6` (Blue)
- **Food:** `#F97316` (Orange)
- **Tools:** `#64748B` (Gray)
- **Documents:** `#EAB308` (Yellow)
- **Decoration:** `#A855F7` (Purple)

## Testing

### Test Cases
1. ✅ Add item without specifying color (should use default #6366f1)
2. ✅ Add item with custom color
3. ✅ Edit item and change color
4. ✅ Verify color applies to icon background
5. ✅ Verify color applies to icon itself
6. ✅ Verify color applies to location badge
7. ✅ Verify color applies to quantity badge
8. ✅ Refresh page and verify color persists
9. ✅ Change color and verify real-time update
10. ✅ Verify color sync across multiple devices

## Browser Support

The color customization feature uses standard CSS and HTML color inputs supported in all modern browsers:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Performance Notes

- Color operations are lightweight (hex conversion, RGB parsing)
- CSS filters are GPU-accelerated in modern browsers
- No additional API calls needed for color operations
- Colors are stored as 7-character strings in database (minimal storage)

## Future Enhancements

1. **Color Presets:** Pre-defined color palette for quick selection
2. **Color Themes:** Automatic color assignment based on item category
3. **Gradient Support:** Allow gradient colors for items
4. **Color History:** Track previously used colors for quick access
5. **Team Colors:** Assign colors by user or category for shared inventories
6. **Accessibility:** High contrast color recommendations for readability
7. **Color Export:** Export inventory with color information for printing
8. **QR Code Colors:** Use item color in QR code background

## Troubleshooting

### Colors Not Applying
**Problem:** Color picker shows but colors don't apply to items
**Solution:** Ensure migration 005 has been applied to Supabase

### Invalid Color Format
**Problem:** "Invalid color" error when entering hex code
**Solution:** Use 6-digit hex format with `#` prefix (e.g., `#FF5733`)

### Colors Not Persisting
**Problem:** Colors don't save after page refresh
**Solution:** Check that migration has been applied and sync status shows complete

### Icon Looks Wrong with Color
**Problem:** Icon color filter makes icon look distorted
**Solution:** Try a different color or use the icon picker to select a better icon

## API Reference

### Color Field
```typescript
interface InventoryItem {
  // ... other fields
  color?: string;  // Hex color code (e.g., "#FF5733")
}
```

### Color Defaults
- **Fallback Color:** `#6366f1` (used if color is not set)
- **Storage Format:** Hex string with `#` prefix
- **Minimum Length:** 7 characters (including `#`)

## Notes for Developers

### Adding Color to New Features
If you add new UI elements that should respect item colors, use the color utility functions:

```typescript
import { getColorWithOpacity, getColorBorder } from '@/lib/colorUtils';

<div style={{
  backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
  borderColor: getColorBorder(item.color || '#6366f1', 0.3),
}}>
  {/* content */}
</div>
```

### Color Validation
Always provide a fallback to the default color when the item color might be undefined:

```typescript
const color = item.color || '#6366f1';
```

---

**Status:** ✅ Feature Complete and Ready for Testing

**Last Updated:** 2024-12-27
