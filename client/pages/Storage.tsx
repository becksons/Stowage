import { useState } from "react";
import { Plus, Search, MapPin, Trash2, MoreVertical, X, Edit, Loader2, Layers, Briefcase, Home, Grid3x3, BookOpen, Box, Sparkles, Filter } from "lucide-react";
import Layout from "@/components/Layout";
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
  const { items } = useSupabaseInventory();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "drawer" as const,
    description: "",
    color: "bg-blue-100 dark:bg-blue-950",
    icon: "",
    parentId: null as string | null,
  });

  const getItemsByLocation = (locationName: string) => {
    return items.filter((item) => item.location === locationName);
  };

  const filteredLocations = getFilteredLocations();

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

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black gradient-heading mb-2">Storage Spaces</h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/40 hover:border-primary/60 transition-all">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">
                  {locations.length} location{locations.length !== 1 ? "s" : ""} organized
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-base px-6 py-3 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Location</span>
          </Button>
        </div>

        <div className="flex gap-4 items-end">
          <div className="relative group flex-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
              <Input
                placeholder="Search storage locations..."
                className="pl-12 py-2.5 text-base border-primary/20 focus:border-primary/50 focus:ring-primary/30 rounded-lg bg-card/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border-2 border-primary/40 text-primary font-semibold text-sm whitespace-nowrap">
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 mb-6 group">
              <Box className="w-12 h-12 text-primary transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-2xl font-black gradient-heading mb-3">No storage locations</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {locations.length === 0
                ? "Create your first storage location to get started organizing!"
                : "No locations match your search. Try adjusting your query."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredLocations.filter((loc) => !loc.parentId).map((location) => {
              const itemCount = getItemsByLocation(location.name).length;
              const childLocations = getChildLocations(location.id);
              const parentLocation = getParentLocation(location.parentId);
              const storageType = storageTypes.find(
                (t) => t.value === location.type
              );

              return (
                <div key={location.id} className="space-y-3">
                  <div
                    className={`group relative p-6 sm:p-8 rounded-2xl border-2 border-primary/20 hover:border-primary/60 transition-all duration-300 overflow-hidden ${location.color}`}
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />

                    <div className="relative flex flex-col items-center text-center mb-6">
                      <div className="relative p-4 rounded-2xl bg-primary/15 border-2 border-primary/30 transform group-hover:scale-105 transition-transform duration-300 mb-4">
                        {location.icon ? (
                          <img
                            src={getStorageIconPath(location.icon)}
                            alt={location.icon}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          />
                        ) : storageType ? (
                          <storageType.icon className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                        ) : (
                          <Box className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                        )}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{location.name}</h3>
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                            <Filter className="w-3 h-3" />
                            {storageType?.label}
                          </span>
                          {childLocations.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
                              <Layers className="w-3 h-3" />
                              {childLocations.length} nested
                            </span>
                          )}
                        </div>
                        {parentLocation && (
                          <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Part of <span className="text-primary font-semibold">{parentLocation.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(location)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteLocation(location.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {location.description && (
                      <p className="text-sm text-foreground mb-4 italic opacity-90 flex items-start gap-2">
                        <Filter className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
                        {location.description}
                      </p>
                    )}

                    {itemCount > 0 ? (
                      <div className="relative pt-4 border-t border-primary/20">
                        <p className="text-sm font-semibold text-foreground mb-3">Items in this location:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {getItemsByLocation(location.name).map((item) => (
                            <div key={item.id} className="flex flex-col items-center text-center">
                              <div className="w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 p-1.5 flex items-center justify-center mb-2">
                                {item.icon ? (
                                  <img
                                    src={getItemIconPath(item.icon)}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Box className="w-6 h-6 text-primary/60" />
                                )}
                              </div>
                              <p className="text-xs font-medium text-foreground line-clamp-2">{item.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="relative pt-4 border-t border-primary/20">
                        <p className="text-sm text-muted-foreground text-center italic">No items stored yet</p>
                      </div>
                    )}
                  </div>

                  {childLocations.length > 0 && (
                    <div className="ml-4 sm:ml-6 space-y-3 border-l-2 border-primary/30 pl-4 sm:pl-6">
                      <p className="text-sm font-semibold text-muted-foreground ml-2">Storage inside this space:</p>
                      {childLocations.map((child) => {
                        const childItemCount = getItemsByLocation(child.name).length;
                        const childStorageType = storageTypes.find(
                          (t) => t.value === child.type
                        );
                        return (
                          <div
                            key={child.id}
                            className={`group relative p-4 sm:p-6 rounded-xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden ${child.color}`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-start justify-between mb-3">
                              <div className="flex flex-col items-center text-center">
                                <div className="p-3 rounded-lg bg-primary/15 border-2 border-primary/30 transform group-hover:scale-110 transition-transform duration-300 mb-2">
                                  {child.icon ? (
                                    <img
                                      src={getStorageIconPath(child.icon)}
                                      alt={child.icon}
                                      className="w-10 h-10 object-contain"
                                    />
                                  ) : childStorageType ? (
                                    <childStorageType.icon className="w-10 h-10 text-primary" />
                                  ) : (
                                    <Box className="w-10 h-10 text-primary" />
                                  )}
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-1">{child.name}</h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                                  <Filter className="w-3 h-3" />
                                  {childStorageType?.label}
                                </span>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenDialog(child)}>
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

                            {child.description && (
                              <p className="text-xs text-foreground mb-3">
                                {child.description}
                              </p>
                            )}

                            {childItemCount > 0 ? (
                              <div className="pt-3 border-t border-border/50">
                                <div className="grid grid-cols-3 gap-2">
                                  {getItemsByLocation(child.name).map((item) => (
                                    <div key={item.id} className="flex flex-col items-center text-center">
                                      <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/30 p-1 flex items-center justify-center">
                                        {item.icon ? (
                                          <img
                                            src={getItemIconPath(item.icon)}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <Box className="w-4 h-4 text-primary/60" />
                                        )}
                                      </div>
                                      <p className="text-xs font-medium text-foreground line-clamp-1 mt-0.5">{item.name}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="pt-3 border-t border-border/50">
                                <p className="text-xs text-muted-foreground text-center italic">No items</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
              <Label htmlFor="parentId">Parent Location (optional)</Label>
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
                  <SelectValue placeholder="None - This is a root location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Root Location</SelectItem>
                  {locations
                    .filter((loc) => loc.id !== editingLocation?.id)
                    .map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {getLocationPath(location.id)}
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
