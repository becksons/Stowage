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

### SVG Colorization

The `ColorizedIcon` component (`client/components/ColorizedIcon.tsx`) is responsible for applying colors to SVG icons. It works by:

1. **Fetching the SVG file** from the icon path
2. **Parsing the SVG XML** to find color attributes
3. **Replacing color values**:
   - Replaces `fill` attributes with the custom color
   - Replaces `stroke` attributes with the custom color
   - Updates inline `style` properties
   - Updates gradient `stop-color` values
4. **Creating a data URL** with the modified SVG
5. **Displaying the colored SVG** via the `<img>` tag

**Usage:**
```tsx
import ColorizedIcon from '@/components/ColorizedIcon';

<ColorizedIcon
  src="/icons/items/Laptop.svg"
  alt="Laptop"
  color="#EF4444"  // Red
  className="w-full h-full object-contain"
/>
```

**Features:**
- ✅ Preserves transparent areas (won't colorize `fill="none"`)
- ✅ Handles multiple fill/stroke attributes
- ✅ Supports gradient colors
- ✅ Works with inline styles
- ✅ Gracefully falls back to original icon on error
- ✅ Cleans up object URLs to prevent memory leaks

### Color Utility Functions
Located in `client/lib/colorUtils.ts`:

- **`hexToRgb(hex)`**: Converts hex color to RGB object
- **`rgbToHex(r, g, b)`**: Converts RGB to hex color
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
   - Updated icon preview to show color applied
   - Integrated ColorizedIcon component for live color preview

4. **client/pages/Inventory.tsx**
   - Imported color utility functions and ColorizedIcon
   - Updated icon container styling to use item color
   - Updated location badge to use item color
   - Updated quantity badge to use item color
   - Applied actual SVG color via ColorizedIcon component

5. **client/pages/Storage.tsx**
   - Integrated ColorizedIcon for storage item icons
   - Applied colors to container icons
   - Applied colors to items inside containers

6. **client/lib/colorUtils.ts** (NEW)
   - Utility functions for color operations

7. **client/components/ColorizedIcon.tsx** (NEW)
   - Smart SVG colorization component
   - Fetches SVG and modifies fill/stroke colors
   - Handles color replacement in gradients and styles
   - Creates data URLs for colored SVG display

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

### SVG Icon Not Colorizing
**Problem:** Icon displays in original color despite color selection
**Causes:**
- SVG file uses hardcoded colors that aren't in `fill` or `stroke` attributes
- SVG uses CSS classes for styling instead of attributes
- Network error fetching the SVG file
**Solutions:**
1. Check browser console for fetch errors
2. Verify SVG file exists at the icon path
3. Try a different color to see if ColorizedIcon is working
4. Check SVG file structure - ensure it uses `fill` or `stroke` attributes

### Icon Looks Different After Colorizing
**Problem:** Icon appearance changes after color is applied
**Explanation:** This is expected - the ColorizedIcon component replaces all color attributes with the new color
**Solution:**
- If using multi-colored icons, consider using a different icon
- Icons work best with single-color designs
- Test color combinations before finalizing

### Memory Leak Warning
**Problem:** Console shows memory leak warning about object URLs
**Solution:** The ColorizedIcon component handles cleanup automatically; if the issue persists, clear browser cache

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
