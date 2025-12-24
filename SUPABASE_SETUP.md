# 🚀 Supabase Setup Guide for Stowage

This guide will walk you through setting up Supabase as your cloud database backend for Stowage.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- PostgreSQL database (included with Supabase)
- Supabase project created

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `stowage` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for it to initialize (~2 minutes)

## Step 2: Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these credentials:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Public Key** (visible in the list)
   - **Service Role Secret Key** (keep this private!)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Add your actual credentials from Step 2

⚠️ **IMPORTANT**: Never commit `.env` to git. It's already in `.gitignore`.

## Step 4: Set Up the Database Schema

### Option A: Use Supabase SQL Editor (Easiest)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_create_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or Ctrl+Enter)
6. You'll see success messages for each table creation

### Option B: Use Supabase CLI (Recommended for development)

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Start local development
supabase start
```

## Step 5: Install Supabase Client

The Supabase client is already in `package.json`, but if needed:

```bash
npm install @supabase/supabase-js
```

## Step 6: Verify the Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `storage_locations`
   - `inventory_items`
   - `item_tags`
   - `item_photos`
   - `shared_inventories`
   - `activity_log`

3. Check **Authentication** → **Users** (should be empty for now)

## Step 7: Test the Integration

Create a simple test component:

```typescript
// client/pages/TestSupabase.tsx
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Connection failed:', error);
      } else {
        console.log('✅ Supabase connected! Data:', data);
      }
    };

    testConnection();
  }, []);

  return <div>Check console for connection test</div>;
}
```

## Step 8: Enable Row Level Security (RLS)

The migration already sets up RLS policies, but verify they're active:

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. Click on a table to view its policies

## Current Architecture

### Before (localStorage only)
```
Frontend Components
        ↓
    localStorage
        ↓
  (Synced: NO)
```

### After (with Supabase)
```
Frontend Components
        ↓
  useSupabaseInventory / useSupabaseStorage
        ↓
    Supabase Client
        ↓
    PostgreSQL Database
        ↓
  ✅ Real-time sync across devices
  ✅ Cloud backup
  ✅ Multi-user support
```

## How It Works

### Authentication Flow
1. User signs up with email/password → `useAuth().signUp()`
2. Supabase creates user in `auth.users` table
3. Trigger automatically creates profile in `profiles` table
4. User can now sync data to cloud

### Data Sync Flow
1. User adds item → `useSupabaseInventory().addItem()`
2. Item inserted into `inventory_items` table
3. Tags inserted into `item_tags` table
4. Activity logged in `activity_log` table
5. Real-time subscription notifies all connected clients
6. Local cache updated for offline access

### Offline Support
- Data loads from localStorage on app start
- Syncs with cloud when connection available
- Changes made offline are queued and synced when online
- Real-time subscriptions keep data fresh

## Security Features

### Row Level Security (RLS)
- Users can only see their own data
- Family members can see shared inventories
- Data is automatically filtered by `user_id`

### Example: Users can only view their own items
```sql
CREATE POLICY "Users can view their own items"
  ON public.inventory_items
  FOR SELECT
  USING (user_id = auth.uid());
```

### Authentication Checks
- All API calls validate `auth.uid()`
- Service role key (for server-side only) bypasses RLS
- Never expose service role key in frontend

## Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution**: Make sure `.env` file exists with both SUPABASE variables

### Issue: "Database connection refused"
**Solution**: 
1. Check your project URL is correct
2. Verify your anon key is for the right project
3. Check internet connection

### Issue: "Permission denied" when inserting data
**Solution**: 
1. Make sure RLS policies exist
2. Check user is authenticated (`auth.uid()` returns value)
3. Verify user_id in INSERT matches authenticated user

### Issue: Tables not appearing
**Solution**:
1. Refresh the Supabase dashboard
2. Re-run the SQL migration
3. Check for SQL errors in the query results

## Next Steps

1. **Update Components**: Replace localStorage hooks with Supabase hooks
2. **Add Auth UI**: Create login/signup pages
3. **Test Real-time Sync**: Open app in two tabs, make changes
4. **Enable Photos**: Set up storage bucket for item photos
5. **Add Cloud Backup**: Implement automatic daily backups

## Files Created

- `supabase/migrations/001_create_initial_schema.sql` - Database schema
- `client/lib/supabase.ts` - Supabase client initialization
- `client/hooks/useAuth.ts` - Authentication hook
- `client/hooks/useSupabaseInventory.ts` - Inventory sync hook
- `client/hooks/useSupabaseStorage.ts` - Storage locations sync hook
- `.env.example` - Environment variables template

## Useful Supabase Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## Need Help?

- Check Supabase status: https://status.supabase.com
- Join Supabase Discord: https://discord.supabase.io
- GitHub Issues: https://github.com/supabase/supabase/issues

---

**Last Updated**: December 2024
**Status**: Ready to implement
