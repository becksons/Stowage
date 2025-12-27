import { useState, useRef } from "react";
import { Search, Trash2, MapPin, Package, MoreVertical, Plus, Loader2, Sparkles, Clock, Type, Layers, Tag, DollarSign, Star, Zap, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import AddEditItemDialog from "@/components/AddEditItemDialog";
import ColorizedIcon from "@/components/ColorizedIcon";
import { useSupabaseInventory } from "@/hooks/useSupabaseInventory";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getItemIconPath, getStorageIconPath } from "@/lib/customIcons";
import { getColorWithOpacity, getColorBorder } from "@/lib/colorUtils";

export default function Inventory() {
  const { toast } = useToast();
  const { items, searchQuery, setSearchQuery, isLoaded, isSyncing, error, addItem, updateItem, deleteItem, getTotalValue, getFilteredItems } = useSupabaseInventory();
  const { locations, getLocationPath } = useSupabaseStorage();
  const [filterLocation, setFilterLocation] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "location" | "recent">("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Include both storage locations and storage items as available places to put items
  const storageItems = items.filter((item) => item.isStorageItem);
  const locationNames = [
    ...locations.map((loc) => loc.name),
    ...storageItems.map((item) => item.name),
  ];

  let displayItems = getFilteredItems();

  // Filter out items that are marked as storage items
  displayItems = displayItems.filter((item) => !item.isStorageItem);

  if (filterLocation) {
    displayItems = displayItems.filter((item) => item.location === filterLocation);
  }

  displayItems = [...displayItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "location":
        return a.location.localeCompare(b.location);
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const handleSaveItem = async (data: any) => {
    try {
      // Look up location_id from location name (could be a storage location or storage item)
      const storageLocation = locations.find((loc) => loc.name === data.location);
      const location_id = storageLocation?.id;

      // If it's not a storage location, it might be a storage item being used as a container
      // For now, we'll use the location name only if it's a storage item
      const isStorageItemContainer = !location_id && storageItems.some((item) => item.name === data.location);

      if (!location_id && !isStorageItemContainer) {
        toast({
          title: "Error",
          description: "Selected location not found",
          variant: "destructive",
        });
        return;
      }

      // For storage item containers, location_id might be null, but that's ok
      // since we store the location name which is used to find items
      const itemData = {
        ...data,
        location_id: location_id || null,
      };

      if (editingItem) {
        await updateItem(editingItem.id, itemData);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        setEditingItem(null);
      } else {
        await addItem(itemData);
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }
      setDialogOpen(false);
    } catch (err) {
      console.error('Item save error:', err);
      let errorMessage = "Failed to save item";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle Supabase errors and other objects
        const errObj = err as any;
        if (errObj.message) {
          errorMessage = errObj.message;
        } else if (errObj.error_description) {
          errorMessage = errObj.error_description;
        } else if (errObj.msg) {
          errorMessage = errObj.msg;
        } else {
          errorMessage = JSON.stringify(errObj);
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const totalValue = getTotalValue();

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black gradient-heading mb-3">Inventory</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/40 hover:border-primary/60 transition-all">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">
                  {items.length} item{items.length !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingItem(null);
                setDialogOpen(true);
              }}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-base px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>

          {totalValue > 0 && (
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-primary/15 to-secondary/15 border-2 border-primary/40 overflow-hidden group hover:border-primary/60 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <p className="text-sm font-semibold text-primary/80">Total Inventory Value</p>
                  </div>
                  <p className="text-4xl font-black text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                    ${totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/40">
                  <DollarSign className="w-6 h-6 text-primary opacity-70" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
              <Input
                placeholder="Search items or locations..."
                className="pl-12 py-2.5 text-base border-primary/20 focus:border-primary/50 focus:ring-primary/30 rounded-lg bg-card/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2.5 rounded-lg border-2 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm text-sm font-semibold focus:outline-none focus:border-primary/60 focus:ring-primary/30 transition-all"
          >
            <option value="">All locations</option>
            {locationNames.map((name) => (
              <option key={name} value={name}>
                • {name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg border-2 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm text-sm font-semibold focus:outline-none focus:border-primary/60 focus:ring-primary/30 transition-all"
          >
            <option value="recent">Most Recent</option>
            <option value="name">By Name</option>
            <option value="location">By Location</option>
          </select>

          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border-2 border-primary/40 text-primary font-semibold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 mb-6 group">
              <Package className="w-12 h-12 text-primary transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-2xl font-black gradient-heading mb-3">No items yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {items.length === 0
                ? "Start by adding your first item to your inventory and begin tracking!"
                : "No items match your search or filters. Try adjusting them."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col items-center text-center transition-all duration-300 p-2"
              >
                {/* Icon - Large and prominent, like a physical object */}
                {item.icon && (
                  <div className="relative mb-2 transform group-hover:scale-110 transition-transform duration-300 cursor-pointer" onClick={() => handleOpenEdit(item)}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.1),
                    }}>
                      <ColorizedIcon
                        src={getItemIconPath(item.icon)}
                        alt={item.icon}
                        color={item.color || '#6366f1'}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                      />
                    </div>
                    {/* Subtle shadow effect on hover */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity shadow-xl blur-lg -z-10" style={{
                      backgroundColor: item.color || '#6366f1',
                    }} />
                  </div>
                )}

                {/* Item name - Clean and simple */}
                <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 mb-1 px-1 hover:underline cursor-pointer transition-all" onClick={() => handleOpenEdit(item)}>
                  {item.name}
                </h3>

                {/* Location badge - Minimal */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1" style={{
                  backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                  color: item.color || '#6366f1',
                }}>
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>

                {/* Description - Optional and small */}
                {item.description && (
                  <p className="text-xs text-foreground/60 line-clamp-1 mb-1 px-1 italic">
                    {item.description}
                  </p>
                )}

                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{
                    backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                    color: item.color || '#6366f1',
                  }}>
                    <Package className="w-3 h-3" />
                    {item.quantity}
                  </div>
                )}

                {/* More menu - appears on hover */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tags - if any */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {item.tags.map((tag) => {
                      const displayValue = tag.value
                        ? tag.type === "price"
                          ? `$${tag.value}`
                          : tag.value
                        : "";
                      const icons: { [key: string]: React.ElementType } = {
                        price: DollarSign,
                        type: Tag,
                        importance: Star,
                        custom: Zap,
                      };
                      const IconComponent = icons[tag.type as keyof typeof icons] || Zap;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
                          style={{
                            backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                            color: item.color || '#6366f1',
                          }}
                          title={`${tag.type}: ${tag.name}`}
                        >
                          <IconComponent className="w-2.5 h-2.5" />
                          {tag.name}
                          {displayValue && <span className="font-bold">{displayValue}</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditItemDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        locations={locationNames}
        onSave={handleSaveItem}
        existingItem={editingItem}
        getLocationPath={getLocationPath}
        locationObjects={locations}
        storageItems={storageItems}
      />
    </Layout>
  );
}
