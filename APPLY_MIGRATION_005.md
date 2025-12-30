# Applying Color Feature Migration to Supabase

## ⚠️ Important: This step is required for color customization to work!

The color feature requires a database migration to add a `color` column to the `inventory_items` table. If this migration hasn't been applied, colors **will not save** to the database.

## 🔧 How to Apply the Migration

### Step 1: Open Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Login to your account
3. Select your project

### Step 2: Go to SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. You should see a list of your recent queries

### Step 3: Create New Query
1. Click the **"New Query"** button (or `+` icon)
2. A new SQL editor will open

### Step 4: Copy the Migration SQL
Copy the entire SQL query below:

```sql
-- Add color column to inventory_items table
-- This allows items to have custom colors for display and icon coloring

ALTER TABLE public.inventory_items 
ADD COLUMN color VARCHAR(7) DEFAULT '#6366f1';

-- Create index for efficient color-based queries
CREATE INDEX idx_inventory_items_color 
ON public.inventory_items(user_id, color);
```

### Step 5: Paste into Supabase SQL Editor
1. Click in the SQL editor window
2. Delete any existing text
3. Paste the SQL query above
4. Your editor should show the query

### Step 6: Execute the Query
1. Click the **"RUN"** button (or press `Ctrl+Enter`)
2. Wait for the query to complete (usually takes 1-2 seconds)

### Step 7: Verify Success
You should see a message like:
```
✅ Success! Query executed successfully
```

Or you might see:
```
Error: column "color" of relation "inventory_items" already exists
```

**If you see the error above:** This means the migration was already applied! No action needed.

## ✅ Verify the Migration Was Applied

### Method 1: Check Table Structure
1. In the Supabase dashboard, go to **"Table Editor"**
2. Click on the **`inventory_items`** table
3. Scroll right to see all columns
4. You should see a `color` column with type `varchar`
5. Default value should be `'#6366f1'`

### Method 2: Query the Column
Run this in the SQL Editor to verify:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' AND column_name = 'color';
```

You should see:
```
column_name | data_type    | column_default
color       | character varying | '#6366f1'::character varying
```

## 🐛 Troubleshooting

### "ERROR: relation 'public.inventory_items' does not exist"
- The table doesn't exist yet
- Make sure you've applied the initial schema migration first (Migration 001)

### "ERROR: column 'color' already exists"
- The column was already added
- This is fine! Just proceed with using the color feature

### Colors still not changing after applying migration?
1. ✅ Check that the migration was successfully applied (see verification steps above)
2. ✅ Clear your browser cache (or hard refresh: `Ctrl+Shift+R`)
3. ✅ Close and reopen the app
4. ✅ Try adding a new item with a color
5. ✅ Check browser console (F12 > Console tab) for any error messages

### Migration appears to succeed but nothing changed?
1. Make sure you're using the correct Supabase project
2. Verify you're logged into the right account
3. Try refreshing the page to reload data from database
4. Check the browser console for any error messages

## 📝 What This Migration Does

The migration:
1. ✅ Adds a new `color` column to the `inventory_items` table
2. ✅ Sets the column type to `VARCHAR(7)` (stores hex colors like `#FF5733`)
3. ✅ Sets the default color to `#6366f1` (indigo) for all items
4. ✅ Creates an index for fast color-based queries
5. ✅ Applies to all existing and new items

## 🚀 After Applying the Migration

Once the migration is applied:
1. Existing items will have the default color (`#6366f1`)
2. You can edit items to change their color
3. Colors will be saved to the database
4. Colors will sync across all devices
5. Colors will persist after refresh

## ❓ Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console (F12) for error messages
3. Make sure you're in the right Supabase project
4. Try refreshing the page after applying the migration
5. Check that the `inventory_items` table exists and has the correct columns

---

**Important:** This migration must be applied to each Supabase project individually. If you have multiple projects (development, staging, production), you'll need to apply the migration to each one.
