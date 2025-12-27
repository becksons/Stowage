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
import { getStorageIconPath, getStorageIconOptions, getItemIconPath } from "@/lib/customIcons";
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
  const { items, deleteItem } = useSupabaseInventory();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
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
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        await addLocation(formData);
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }

      setOpenDialog(false);
      setEditingLocation(null);
      setFormData({
        name: "",
        type: "drawer",
        description: "",
        color: "bg-blue-100 dark:bg-blue-950",
        icon: "",
        parentId: null,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: error || "Failed to save location",
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
  const selectedLocation = selectedLocationId ? locations.find((loc) => loc.id === selectedLocationId) : null;
  const selectedChildLocations = selectedLocation ? getChildLocations(selectedLocation.id) : [];

  return (
    <Layout>
      <div className="h-screen flex flex-col lg:flex-row gap-6 animate-fade-in overflow-hidden">
        {/* Left Sidebar - Room Navigation */}
        <div className="lg:w-80 flex flex-col border-r border-primary/20 pr-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black gradient-heading mb-2">Storage Spaces</h1>
              <p className="text-sm text-muted-foreground">Select a room to view</p>
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
              className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-sm px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Room
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

          {/* Room List */}
          <div className="flex-1 overflow-y-auto mt-6 space-y-2">
            {rootLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No rooms yet</p>
              </div>
            ) : (
              rootLocations.map((location) => {
                const itemCount = getItemsByLocation(location.name).length;
                const childCount = getChildLocations(location.id).length;
                const storageType = storageTypes.find((t) => t.value === location.type);
                const isSelected = selectedLocationId === location.id;

                return (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocationId(location.id)}
                    className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                      isSelected
                        ? "border-primary/50 bg-primary/10"
                        : "border-primary/20 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Location Icon */}
                      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} style={{
                        backgroundColor: getColorWithOpacity('#6366f1', 0.1),
                      }}>
                        {location.icon ? (
                          <img
                            src={getStorageIconPath(location.icon)}
                            alt={location.icon}
                            className="w-7 h-7 object-contain"
                          />
                        ) : storageType ? (
                          <storageType.icon className="w-6 h-6 text-primary" />
                        ) : (
                          <Box className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      {/* Location Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">{location.name}</h3>
                      </div>

                      {/* Menu Button */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3 h-3" />
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
              })
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

        {/* Right Content Area - Room Details */}
        <div className="flex-1 overflow-y-auto">
          {!selectedLocation ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 mb-6">
                <Home className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Select a Room</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Choose a room from the sidebar to view and manage its storage spaces and items.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Selected Room Header */}
              <div className="space-y-6 pb-6 border-b border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-5xl font-black gradient-heading mb-3">{selectedLocation.name}</h2>
                    {selectedLocation.description && (
                      <p className="text-base text-muted-foreground mb-4">{selectedLocation.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/30">
                        {storageTypes.find((t) => t.value === selectedLocation.type)?.label}
                      </span>
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

                {/* Stats Bar */}
                <div className="inline-flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-primary">{selectedChildLocations.length}</span>
                    <span className="text-xs text-muted-foreground font-semibold">section{selectedChildLocations.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-px h-12 bg-primary/20"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-primary">{getItemsByLocation(selectedLocation.name).length}</span>
                    <span className="text-xs text-muted-foreground font-semibold">item{getItemsByLocation(selectedLocation.name).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Storage Sections / Child Locations */}
              {selectedChildLocations.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">Storage Sections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedChildLocations.map((child) => {
                      const childItemCount = getItemsByLocation(child.name).length;
                      const childStorageType = storageTypes.find((t) => t.value === child.type);

                      return (
                        <div
                          key={child.id}
                          className="group relative p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden hover:shadow-lg"
                          style={{
                            backgroundColor: getColorWithOpacity(child.color ? child.color.replace('dark:', '').split(' ')[0] : 'bg-blue-100', 0.06),
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-foreground mb-1">{child.name}</h4>
                                <p className="text-xs text-muted-foreground font-semibold mb-2">{childStorageType?.label}</p>
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
                              {childItemCount > 0 ? (
                                <div>
                                  <p className="text-xs text-muted-foreground font-semibold mb-3">
                                    {childItemCount} item{childItemCount !== 1 ? 's' : ''}
                                  </p>
                                  <div className="grid grid-cols-1 gap-4">
                                    {getItemsByLocation(child.name).map((item) => (
                                      <div key={item.id} className="group/item relative flex flex-col items-center text-center transition-all duration-300">
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
                                                className="w-16 h-16 object-contain"
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
                                <p className="text-xs text-muted-foreground text-center italic">No items in this section</p>
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
                <div className="space-y-6 pt-6 border-t border-primary/20">
                  <h3 className="text-2xl font-bold text-foreground">
                    Loose Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getItemsByLocation(selectedLocation.name).map((item) => (
                      <div key={item.id} className="group relative flex flex-col items-center text-center transition-all duration-300 p-2">
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
                                className="w-14 h-14 object-contain"
                              />
                            </div>
                          </div>
                        )}

                        {/* Item name */}
                        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 px-1">{item.name}</h3>

                        {/* Item description */}
                        {item.description && (
                          <p className="text-xs text-foreground/60 line-clamp-1 mb-1 px-1 italic">
                            {item.description}
                          </p>
                        )}

                        {/* Quantity badge */}
                        {item.quantity && item.quantity > 1 && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mb-1" style={{
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
          )}
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add Storage Location"}
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
              <Label htmlFor="icon">Storage Icon</Label>
              <div className="flex gap-2 items-center">
                {formData.icon && (
                  <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={getStorageIconPath(formData.icon)}
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
                    <SelectValue placeholder="Choose a custom icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use type icon</SelectItem>
                    {getStorageIconOptions().map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <img
                            src={getStorageIconPath(icon)}
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
                {editingLocation ? "Update Location" : "Add Location"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
