# 📚 Supabase Integration Guide

This guide shows how to integrate the new Supabase hooks into your existing components.

## Overview

You now have parallel implementations:
- **Old**: `useInventory.ts` and `useStorage.ts` (localStorage only)
- **New**: `useSupabaseInventory.ts` and `useSupabaseStorage.ts` (cloud sync)

We'll migrate component by component while maintaining backward compatibility.

## Migration Strategy

### Phase 1: Add Authentication Layer
1. Create auth pages (login/signup)
2. Protect routes with auth guards
3. Redirect unauthenticated users to login

### Phase 2: Switch to Cloud Hooks
1. Update components to use `useSupabaseInventory` instead of `useInventory`
2. Update components to use `useSupabaseStorage` instead of `useStorage`
3. Test that all features work with cloud sync

### Phase 3: Remove localStorage
1. Remove old hooks (once cloud version is stable)
2. Clean up local storage
3. Test complete cloud workflow

## Detailed Integration Steps

### Step 1: Create Login Page

Create `client/pages/Auth.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      navigate('/inventory');
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-20">
        <h1 className="text-3xl font-bold gradient-heading mb-8 text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>

        {error && (
          <div className="p-4 rounded-lg bg-red-100 text-red-800 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-primary font-semibold hover:underline"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </Layout>
  );
}
```

### Step 2: Create Protected Route

Create `client/components/ProtectedRoute.tsx`:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
```

### Step 3: Update App Routes

Update your router to include auth routes and protected routes:

```typescript
// In your main App.tsx or router setup
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';

<Routes>
  <Route path="/auth" element={<Auth />} />
  
  <Route
    path="/inventory"
    element={
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    }
  />
  
  <Route
    path="/storage"
    element={
      <ProtectedRoute>
        <Storage />
      </ProtectedRoute>
    }
  />
  
  {/* Other routes */}
</Routes>
```

### Step 4: Update Inventory Component

Change the hook import in `client/pages/Inventory.tsx`:

**Before:**
```typescript
import { useInventory } from '@/hooks/useInventory';
import { useStorage } from '@/hooks/useStorage';
```

**After:**
```typescript
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
```

Then update the hook usage:

```typescript
export default function Inventory() {
  const inventory = useSupabaseInventory();  // Changed
  const storage = useSupabaseStorage();      // Changed
  
  const {
    items,
    searchQuery,
    setSearchQuery,
    isLoaded,
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    getTotalValue,
    getFilteredItems,
    exportData,
    importData,
  } = inventory;

  const { locations } = storage;

  // Rest of component stays the same!
}
```

### Step 5: Update Storage Component

Same pattern for `client/pages/Storage.tsx`:

```typescript
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';

export default function Storage() {
  const {
    locations,
    searchQuery,
    setSearchQuery,
    isLoaded,
    isSyncing,
    addLocation,
    updateLocation,
    deleteLocation,
    getFilteredLocations,
    getChildLocations,
    getParentLocation,
    getLocationPath,
    getRootLocations,
  } = useSupabaseStorage();

  // Rest of component stays the same!
}
```

### Step 6: Add Sync Status Indicator

Enhance the UI to show sync status:

```typescript
{isSyncing && (
  <div className="fixed bottom-4 right-4 p-3 rounded-lg bg-blue-100 text-blue-800 flex items-center gap-2">
    <div className="animate-spin w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full" />
    Syncing...
  </div>
)}

{error && (
  <div className="fixed bottom-4 right-4 p-3 rounded-lg bg-red-100 text-red-800">
    Error: {error}
  </div>
)}
```

## Migration Checklist

### Before Starting
- [ ] Supabase project created and configured
- [ ] Environment variables set (.env file)
- [ ] Database schema applied
- [ ] All tables created successfully

### Phase 1: Authentication
- [ ] Create `Auth.tsx` page
- [ ] Create `ProtectedRoute.tsx` component
- [ ] Update router with auth routes
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Verify user appears in Supabase dashboard

### Phase 2: Cloud Integration
- [ ] Update `Inventory.tsx` to use `useSupabaseInventory`
- [ ] Update `Storage.tsx` to use `useSupabaseStorage`
- [ ] Test adding items (should appear in Supabase dashboard)
- [ ] Test adding locations (should appear in Supabase dashboard)
- [ ] Test updating items
- [ ] Test deleting items
- [ ] Test search & filters

### Phase 3: Real-time Sync
- [ ] Open app in two browser tabs
- [ ] Add item in tab 1
- [ ] Verify item appears in tab 2 (real-time sync)
- [ ] Edit item in tab 2
- [ ] Verify changes in tab 1
- [ ] Test network disconnect/reconnect

### Phase 4: Cleanup
- [ ] Remove old `useInventory` hook (when ready)
- [ ] Remove old `useStorage` hook (when ready)
- [ ] Clean up localStorage (optional, can keep for cache)
- [ ] Remove test auth users from Supabase

## API Changes

### Supabase Hooks Return Extra Fields

```typescript
// Old hook returned:
{
  items,
  searchQuery,
  setSearchQuery,
  isLoaded,
  addItem,
  updateItem,
  deleteItem,
  // ...
}

// New Supabase hook also returns:
{
  items,
  searchQuery,
  setSearchQuery,
  isLoaded,
  isSyncing,      // ← NEW: Shows if syncing to cloud
  error,          // ← NEW: Shows sync errors
  addItem,
  updateItem,
  deleteItem,
  // ...
}
```

### Error Handling

```typescript
// Components should now handle errors:
if (error) {
  return <div>Error: {error}</div>;
}

if (isSyncing) {
  return <div>Syncing...</div>;
}
```

## Backward Compatibility

During migration, you can keep both hooks and toggle between them:

```typescript
const USE_CLOUD = true; // Set to false to use localStorage

const inventory = USE_CLOUD
  ? useSupabaseInventory()
  : useInventory();
```

This allows gradual rollout and easy rollback if needed.

## Performance Notes

### Cloud vs Local
- **Cloud (Supabase)**: Slower (100-500ms for network requests) but syncs across devices
- **Local (localStorage)**: Instant (1-10ms) but single device only

### Optimization Tips
1. Use real-time subscriptions for instant updates
2. Cache responses locally for faster UI
3. Debounce frequent updates
4. Batch operations when possible

```typescript
// Example: Debounced update
const debouncedUpdate = useCallback(
  debounce((id: string, updates: any) => {
    updateItem(id, updates);
  }, 500),
  [updateItem]
);
```

## Troubleshooting

### Data not syncing
1. Check network connection
2. Verify environment variables are correct
3. Check Supabase logs in dashboard
4. Verify RLS policies allow the operation
5. Check browser console for errors

### Real-time not working
1. Ensure Realtime is enabled in Supabase settings
2. Check that subscription is set up correctly
3. Verify table has RLS enabled
4. Check browser websocket connection

### Authentication failing
1. Verify email/password format
2. Check if user exists in Supabase
3. Check auth policies in Supabase dashboard
4. Review error message in browser console

## Next Phase: Add Features

Once cloud sync is working:
1. **Photo uploads** - Create photo component with S3 upload
2. **Family sharing** - UI for inviting family members
3. **Offline support** - Service worker for offline access
4. **Push notifications** - Alert on shared changes

---

**Ready?** Follow the steps above and start the migration! 🚀
