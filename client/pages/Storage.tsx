import { useState } from "react";
import { Plus, Search, MapPin, Trash2, MoreVertical, X, Edit, Loader2, Layers, Briefcase, Home, Grid3x3, BookOpen, Box, Package } from "lucide-react";
import Layout from "@/components/Layout";
import ColorizedIcon from "@/components/ColorizedIcon";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useSupabaseInventory } from "@/hooks/useSupabaseInventory";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStorageIconPath, getStorageIconOptions, getItemIconPath, getItemIconOptions } from "@/lib/customIcons";
import { getColorWithOpacity, getColorBorder } from "@/lib/colorUtils";

const storageTypes = [
  { value: "drawer", label: "Drawer", icon: Layers },
  { value: "bag", label: "Bag", icon: Briefcase },
  { value: "room", label: "Room", icon: Home },
  { value: "cabinet", label: "Cabinet", icon: Grid3x3 },
  { value: "shelf", label: "Shelf", icon: BookOpen },
  { value: "other", label: "Other", icon: Box },
];

const colorOptions = [
  { value: "bg-blue-100 dark:bg-blue-950", label: "Blue" },
  { value: "bg-green-100 dark:bg-green-950", label: "Green" },
  { value: "bg-purple-100 dark:bg-purple-950", label: "Purple" },
  { value: "bg-pink-100 dark:bg-pink-950", label: "Pink" },
  { value: "bg-amber-100 dark:bg-amber-950", label: "Amber" },
  { value: "bg-red-100 dark:bg-red-950", label: "Red" },
];

export default function Storage() {
  const { toast } = useToast();
  const {
    locations,
    searchQuery,
    setSearchQuery,
    isLoaded,
    isSyncing,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    getFilteredLocations,
    getChildLocations,
    getParentLocation,
    getLocationPath,
    getRootLocations,
  } = useSupabaseStorage();
  const { items, deleteItem, updateItem, addItem } = useSupabaseInventory();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingStorageItem, setEditingStorageItem] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedStorageItemId, setSelectedStorageItemId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "drawer" as const,
    description: "",
    color: "bg-blue-100 dark:bg-blue-950",
    icon: "",
    parentId: null as string | null,
  });

  const getItemsByLocation = (locationName: string) => {
    return items.filter((item) => item.location === locationName && !item.isStorageItem);
  };

  const getStorageItemsByLocation = (locationName: string) => {
    return items.filter((item) => item.location === locationName && item.isStorageItem);
  };

  const getStorageItems = () => {
    return items.filter((item) => item.isStorageItem);
  };

  const handleOpenDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        type: location.type,
        description: location.description || "",
        color: location.color || "bg-blue-100 dark:bg-blue-950",
        icon: location.icon || "",
        parentId: location.parentId || null,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        type: "drawer",
        description: "",
        color: "bg-blue-100 dark:bg-blue-950",
        icon: "",
        parentId: null,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter a location name",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingStorageItem) {
        // Update storage item (container)
        await updateItem(editingStorageItem.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        });
        toast({
          title: "Success",
          description: "Container updated successfully",
        });
      } else if (editingLocation) {
        // Update location
        await updateLocation(editingLocation.id, formData);
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        // Create new location
        await addLocation(formData);
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }

      setOpenDialog(false);
      setEditingLocation(null);
      setEditingStorageItem(null);
      setFormData({
        name: "",
        type: "drawer",
        description: "",
        color: "bg-blue-100 dark:bg-blue-950",
        icon: "",
        parentId: null,
      });
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("Are you sure you want to delete this location? Items will still exist in the system.")) {
      try {
        await deleteLocation(id);
        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
        if (selectedLocationId === id) {
          setSelectedLocationId(null);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: error || "Failed to delete location",
          variant: "destructive",
        });
      }
    }
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <p className="text-muted-foreground">Loading storage locations...</p>
        </div>
      </Layout>
    );
  }

  const rootLocations = getRootLocations();
  const storageItems = getStorageItems();
  const selectedLocation = selectedLocationId ? locations.find((loc) => loc.id === selectedLocationId) : null;
  const selectedStorageItem = selectedStorageItemId ? items.find((item) => item.id === selectedStorageItemId && item.isStorageItem) : null;
  const selectedChildLocations = selectedLocation ? getChildLocations(selectedLocation.id) : [];

  return (
    <Layout>
      <div className="h-screen flex flex-col lg:flex-row gap-0 lg:gap-6 animate-fade-in overflow-hidden">
        {/* Left Sidebar - Room Navigation */}
        <div className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-80 flex-col border-b lg:border-b-0 lg:border-r border-primary/20 pb-6 lg:pb-0 lg:pr-6 bg-card lg:bg-transparent z-10 lg:z-auto transition-all duration-300`}>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black gradient-heading mb-1">Storage Spaces</h1>
                <p className="text-xs lg:text-sm text-muted-foreground">Select a room to view</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Add Location Button */}
            <Button
              onClick={() => {
                setEditingLocation(null);
                setFormData({
                  name: "",
                  type: "drawer",
                  description: "",
                  color: "bg-blue-100 dark:bg-blue-950",
                  icon: "",
                  parentId: null,
                });
                setOpenDialog(true);
              }}
              className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-sm px-4 py-3 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Storage Space
            </Button>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  placeholder="Search..."
                  className="pl-10 py-2 text-sm border-primary/20 focus:border-primary/50 focus:ring-primary/30 rounded-lg bg-card/50 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Room & Container List */}
          <div className="flex-1 overflow-y-auto mt-4 lg:mt-6 space-y-2 px-1 lg:px-0">
            {rootLocations.length === 0 && storageItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No storage spaces yet</p>
              </div>
            ) : (
              <>
                {/* Root Locations (Rooms) */}
                {rootLocations.map((location) => {
                  const storageType = storageTypes.find((t) => t.value === location.type);
                  const isSelected = selectedLocationId === location.id && !selectedStorageItemId;

                  return (
                    <div
                      key={`loc-${location.id}`}
                      onClick={() => {
                        setSelectedLocationId(location.id);
                        setSelectedStorageItemId(null);
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`group relative p-4 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 active:scale-95 lg:active:scale-100 hover:border-primary/50 ${
                        isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-primary/20 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Location Icon */}
                        <div className={`w-14 h-14 sm:w-12 sm:h-12 lg:w-12 lg:h-12 rounded-lg flex-shrink-0 flex items-center justify-center transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} style={{
                          backgroundColor: getColorWithOpacity('#6366f1', 0.1),
                        }}>
                          {location.icon ? (
                            <img
                              src={getStorageIconPath(location.icon)}
                              alt={location.icon}
                              className="w-8 h-8 sm:w-7 sm:h-7 lg:w-7 lg:h-7 object-contain"
                            />
                          ) : storageType ? (
                            <storageType.icon className="w-7 h-7 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-primary" />
                          ) : (
                            <Box className="w-7 h-7 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-primary" />
                          )}
                        </div>

                        {/* Location Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-sm lg:text-sm text-foreground line-clamp-1">{location.name}</h3>
                        </div>

                        {/* Menu Button */}
                        <div className="flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 lg:h-6 lg:w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4 lg:w-3 lg:h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditingLocation(location);
                                setFormData({
                                  name: location.name,
                                  type: location.type,
                                  description: location.description || "",
                                  color: location.color || "bg-blue-100 dark:bg-blue-950",
                                  icon: location.icon || "",
                                  parentId: location.parentId || null,
                                });
                                setOpenDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLocation(location.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Storage Items (Containers) */}
                {storageItems.length > 0 && (
                  <>
                    {storageItems.map((item) => {
                      const isSelected = selectedStorageItemId === item.id;

                      return (
                        <div
                          key={`item-${item.id}`}
                          onClick={() => {
                            setSelectedStorageItemId(item.id);
                            setSelectedLocationId(null);
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                          className={`group relative p-4 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 active:scale-95 lg:active:scale-100 hover:border-primary/50 ${
                            isSelected
                              ? "border-primary/50 bg-primary/10"
                              : "border-primary/20 hover:bg-primary/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Item Icon */}
                            <div className={`w-14 h-14 sm:w-12 sm:h-12 lg:w-12 lg:h-12 rounded-lg flex-shrink-0 flex items-center justify-center transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} style={{
                              backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.1),
                            }}>
                              {item.icon && (
                                <img
                                  src={getItemIconPath(item.icon)}
                                  alt={item.icon}
                                  className="w-8 h-8 sm:w-7 sm:h-7 lg:w-7 lg:h-7 object-contain"
                                />
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base sm:text-sm lg:text-sm text-foreground line-clamp-1">{item.name}</h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sync indicator */}
          {isSyncing && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </div>
          )}
        </div>

        {/* Right Content Area - Room/Container Details */}
        <div className={`${
          selectedLocationId || selectedStorageItemId ? 'flex' : 'hidden'
        } lg:flex flex-1 overflow-y-auto flex-col`}>
          {!selectedLocation && !selectedStorageItem ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 mb-6">
                <Box className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Select a Space</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Choose a room or container from the sidebar to view and manage its contents.
              </p>
            </div>
          ) : selectedLocation ? (
            <div className="space-y-8">
              {/* Selected Room Header */}
              <div className="space-y-6 pb-6 border-b border-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => {
                      setSelectedLocationId(null);
                      setSidebarOpen(true);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 flex items-start gap-3 sm:gap-4">
                    {/* Room Icon */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg flex-shrink-0 flex items-center justify-center" style={{
                      backgroundColor: getColorWithOpacity('#6366f1', 0.1),
                    }}>
                      {selectedLocation.icon ? (
                        <img
                          src={getStorageIconPath(selectedLocation.icon)}
                          alt={selectedLocation.icon}
                          className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain"
                        />
                      ) : storageTypes.find((t) => t.value === selectedLocation.type) ? (
                        <>
                          {(() => {
                            const Icon = storageTypes.find((t) => t.value === selectedLocation.type)?.icon;
                            return Icon ? <Icon className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-primary" /> : null;
                          })()}
                        </>
                      ) : (
                        <Box className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-3xl lg:text-5xl font-black gradient-heading mb-3">{selectedLocation.name}</h2>
                      {selectedLocation.description && (
                        <p className="text-base text-muted-foreground mb-4">{selectedLocation.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/30">
                          {storageTypes.find((t) => t.value === selectedLocation.type)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingLocation(selectedLocation);
                        setFormData({
                          name: selectedLocation.name,
                          type: selectedLocation.type,
                          description: selectedLocation.description || "",
                          color: selectedLocation.color || "bg-blue-100 dark:bg-blue-950",
                          icon: selectedLocation.icon || "",
                          parentId: selectedLocation.parentId || null,
                        });
                        setOpenDialog(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Room
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteLocation(selectedLocation.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Storage Sections / Child Locations */}
              {selectedChildLocations.length > 0 && (
                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground">Storage Sections</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {selectedChildLocations.map((child) => {
                      const childItemCount = getItemsByLocation(child.name).length;
                      const childStorageItemCount = getStorageItemsByLocation(child.name).length;
                      const totalChildItems = childItemCount + childStorageItemCount;
                      const childStorageType = storageTypes.find((t) => t.value === child.type);

                      return (
                        <div
                          key={child.id}
                          className="group relative p-4 lg:p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden hover:shadow-lg"
                          style={{
                            backgroundColor: getColorWithOpacity(child.color ? child.color.replace('dark:', '').split(' ')[0] : 'bg-blue-100', 0.06),
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              {/* Icon */}
                              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg flex-shrink-0 flex items-center justify-center" style={{
                                backgroundColor: getColorWithOpacity('#6366f1', 0.15),
                              }}>
                                {child.icon ? (
                                  <img
                                    src={getStorageIconPath(child.icon)}
                                    alt={child.icon}
                                    className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                                  />
                                ) : childStorageType ? (
                                  <>
                                    {(() => {
                                      const Icon = childStorageType.icon;
                                      return <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />;
                                    })()}
                                  </>
                                ) : (
                                  <Box className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-foreground mb-1">{child.name}</h4>
                                {child.description && (
                                  <p className="text-sm text-foreground/60 italic">{child.description}</p>
                                )}
                              </div>

                              {/* Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6 p-0"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setEditingLocation(child);
                                    setFormData({
                                      name: child.name,
                                      type: child.type,
                                      description: child.description || "",
                                      color: child.color || "bg-blue-100 dark:bg-blue-950",
                                      icon: child.icon || "",
                                      parentId: child.parentId || null,
                                    });
                                    setOpenDialog(true);
                                  }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteLocation(child.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Items Grid */}
                            <div className="pt-4 border-t border-primary/20">
                              {totalChildItems > 0 ? (
                                <div>
                                  <p className="text-xs text-muted-foreground font-semibold mb-3">
                                    {totalChildItems} item{totalChildItems !== 1 ? 's' : ''}
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[...getStorageItemsByLocation(child.name), ...getItemsByLocation(child.name)].map((item) => (
                                      <div key={item.id} className="group/item relative flex flex-col items-center text-center transition-all duration-300 p-2">
                                        {/* Icon */}
                                        {item.icon && (
                                          <div className="relative mb-3 transform group-hover/item:scale-110 transition-transform duration-300 cursor-pointer w-full">
                                            <div className="w-full aspect-square rounded-lg flex items-center justify-center" style={{
                                              backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.1),
                                            }}>
                                              <ColorizedIcon
                                                src={getItemIconPath(item.icon)}
                                                alt={item.name}
                                                color={item.color || '#6366f1'}
                                                className="w-12 h-12 object-contain"
                                              />
                                            </div>
                                            {/* Subtle shadow effect on hover */}
                                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover/item:opacity-20 transition-opacity shadow-xl blur-lg -z-10" style={{
                                              backgroundColor: item.color || '#6366f1',
                                            }} />
                                          </div>
                                        )}

                                        {/* Item name */}
                                        <h5 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 mb-1 px-1 hover:underline cursor-pointer">{item.name}</h5>

                                        {/* Location badge */}
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1" style={{
                                          backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                                          color: item.color || '#6366f1',
                                        }}>
                                          <MapPin className="w-3 h-3" />
                                          <span className="line-clamp-1">{child.name}</span>
                                        </div>

                                        {/* Item description */}
                                        {item.description && (
                                          <p className="text-xs text-foreground/60 line-clamp-1 mb-1 px-1 italic">
                                            {item.description}
                                          </p>
                                        )}

                                        {/* Quantity badge */}
                                        {item.quantity && item.quantity > 1 && (
                                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{
                                            backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                                            color: item.color || '#6366f1',
                                          }}>
                                            <Package className="w-3 h-3" />
                                            {item.quantity}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground italic">No items in this section</p>
                                  {/* Debug info */}
                                  {getStorageItems().length > 0 && (
                                    <p className="text-xs text-orange-600 mt-2">
                                      Note: {getStorageItems().length} container(s) exist but may not be assigned to this location
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items in Room (not in subsections) */}
              {getItemsByLocation(selectedLocation.name).length > 0 && selectedChildLocations.length > 0 && (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 pt-4 sm:pt-6 border-t border-primary/20">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    Loose Items
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {getItemsByLocation(selectedLocation.name).map((item) => (
                      <div key={item.id} className="group relative flex flex-col items-center text-center transition-all duration-300 p-1.5 sm:p-2">
                        {/* Icon */}
                        {item.icon && (
                          <div className="relative mb-3 transform group-hover:scale-110 transition-transform duration-300 cursor-pointer w-full">
                            <div className="w-full aspect-square rounded-lg flex items-center justify-center" style={{
                              backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.1),
                            }}>
                              <ColorizedIcon
                                src={getItemIconPath(item.icon)}
                                alt={item.name}
                                color={item.color || '#6366f1'}
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            {/* Subtle shadow effect on hover */}
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity shadow-xl blur-lg -z-10" style={{
                              backgroundColor: item.color || '#6366f1',
                            }} />
                          </div>
                        )}

                        {/* Item name */}
                        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 mb-1 px-1 hover:underline cursor-pointer">{item.name}</h3>

                        {/* Location badge */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1" style={{
                          backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                          color: item.color || '#6366f1',
                        }}>
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>

                        {/* Item description */}
                        {item.description && (
                          <p className="text-xs text-foreground/60 line-clamp-1 mb-1 px-1 italic">
                            {item.description}
                          </p>
                        )}

                        {/* Quantity badge */}
                        {item.quantity && item.quantity > 1 && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{
                            backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                            color: item.color || '#6366f1',
                          }}>
                            <Package className="w-3 h-3" />
                            {item.quantity}
                          </div>
                        )}

                        {/* More menu */}
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this item?")) {
                                    deleteItem(item.id);
                                    toast({
                                      title: "Success",
                                      description: "Item deleted successfully",
                                    });
                                  }
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedChildLocations.length === 0 && getItemsByLocation(selectedLocation.name).length === 0 && (
                <div className="text-center py-12">
                  <Box className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">This room is empty. Add sections or items to get started.</p>
                </div>
              )}
            </div>
          ) : selectedStorageItem ? (
            <div className="space-y-8">
              {/* Selected Container Header */}
              <div className="space-y-6 pb-6 border-b border-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => {
                      setSelectedStorageItemId(null);
                      setSidebarOpen(true);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 flex items-start gap-3 sm:gap-4">
                    {/* Container Icon */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg flex-shrink-0 flex items-center justify-center" style={{
                      backgroundColor: getColorWithOpacity(selectedStorageItem.color || '#6366f1', 0.1),
                    }}>
                      {selectedStorageItem.icon && (
                        <img
                          src={getItemIconPath(selectedStorageItem.icon)}
                          alt={selectedStorageItem.icon}
                          className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-3xl lg:text-5xl font-black gradient-heading mb-3">{selectedStorageItem.name}</h2>
                      {selectedStorageItem.description && (
                        <p className="text-base text-muted-foreground mb-4">{selectedStorageItem.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/30">
                          Container
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingStorageItem(selectedStorageItem);
                        setFormData({
                          name: selectedStorageItem.name,
                          type: "drawer",
                          description: selectedStorageItem.description || "",
                          color: selectedStorageItem.color || "#6366f1",
                          icon: selectedStorageItem.icon || "",
                          parentId: null,
                        });
                        setOpenDialog(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Container
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this container?")) {
                            deleteItem(selectedStorageItem.id);
                            setSelectedStorageItemId(null);
                            toast({
                              title: "Success",
                              description: "Container deleted successfully",
                            });
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Container
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Items in Container */}
              {getItemsByLocation(selectedStorageItem.name).length > 0 ? (
                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground">Items Inside</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getItemsByLocation(selectedStorageItem.name).map((item) => (
                      <div key={item.id} className="group/item relative flex flex-col items-center text-center transition-all duration-300 p-4 rounded-lg border border-primary/20 hover:border-primary/40">
                        {/* Icon */}
                        {item.icon && (
                          <div className="relative mb-3 transform group-hover/item:scale-110 transition-transform duration-300 cursor-pointer w-full">
                            <div className="w-full aspect-square rounded-lg flex items-center justify-center" style={{
                              backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.1),
                            }}>
                              <ColorizedIcon
                                src={getItemIconPath(item.icon)}
                                alt={item.name}
                                color={item.color || '#6366f1'}
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                          </div>
                        )}

                        {/* Item name */}
                        <h5 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 mb-1 px-1">{item.name}</h5>

                        {/* Item description */}
                        {item.description && (
                          <p className="text-xs text-foreground/60 line-clamp-1 mb-1 px-1 italic">
                            {item.description}
                          </p>
                        )}

                        {/* Quantity badge */}
                        {item.quantity && item.quantity > 1 && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{
                            backgroundColor: getColorWithOpacity(item.color || '#6366f1', 0.15),
                            color: item.color || '#6366f1',
                          }}>
                            <Package className="w-3 h-3" />
                            {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Box className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">This container is empty. Add items to get started.</p>
                </div>
              )}
            </div>
          ) : null
        }
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStorageItem
                ? "Edit Container"
                : editingLocation
                ? "Edit Location"
                : "Add Storage Location"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLocation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Bedroom Closet"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Type field - only for locations */}
            {!editingStorageItem ? (
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as "drawer" | "bag" | "room" | "cabinet" | "shelf" | "other",
                    })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storageTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Parent location field - only for locations */}
            {!editingStorageItem ? (
              <div className="space-y-2">
                <Label htmlFor="parentId">Part of (optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  If this storage is inside another space (e.g., a dresser inside a bedroom), select the parent location here.
                </p>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parentId: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="None - Top level location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Top level (not inside anything)</SelectItem>
                    {locations
                      .filter((loc) => loc.id !== editingLocation?.id)
                      .map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          Inside: {getLocationPath(location.id)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Add notes about this location..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">{editingStorageItem ? "Container Icon" : "Storage Icon"}</Label>
              <div className="flex gap-2 items-center">
                {formData.icon && (
                  <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={editingStorageItem ? getItemIconPath(formData.icon) : getStorageIconPath(formData.icon)}
                      alt={formData.icon}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <Select
                  value={formData.icon || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger id="icon" className="flex-1">
                    <SelectValue placeholder={editingStorageItem ? "Choose a container icon" : "Choose a custom icon"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{editingStorageItem ? "Use default" : "Use type icon"}</SelectItem>
                    {(editingStorageItem ? getItemIconOptions() : getStorageIconOptions()).map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <img
                            src={editingStorageItem ? getItemIconPath(icon) : getStorageIconPath(icon)}
                            alt={icon}
                            className="w-4 h-4"
                          />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-primary scale-110"
                        : "border-transparent"
                    } ${color.value}`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                {editingStorageItem
                  ? "Update Container"
                  : editingLocation
                  ? "Update Location"
                  : "Add Location"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
