import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronDown, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, ItemTag } from "@/hooks/useInventory";
import { StorageLocation } from "@/hooks/useStorage";
import { getItemIconOptions, getItemIconPath } from "@/lib/customIcons";

interface AddEditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: string[];
  onSave: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  existingItem?: InventoryItem;
  getLocationPath?: (locationId: string) => string;
  locationObjects?: StorageLocation[];
  storageItems?: any[];
}

const TAG_TYPES = [
  { value: "price", label: "Price" },
  { value: "type", label: "Item Type" },
  { value: "importance", label: "Importance" },
  { value: "custom", label: "Custom" },
];

const IMPORTANCE_LEVELS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

export default function AddEditItemDialog({
  open,
  onOpenChange,
  locations,
  onSave,
  existingItem,
  getLocationPath,
  locationObjects,
  storageItems = [],
}: AddEditItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    quantity: 1,
    icon: "",
    color: "#6366f1",
    isStorageItem: false,
  });
  const [tags, setTags] = useState<ItemTag[]>([]);
  const [tagInput, setTagInput] = useState({
    name: "",
    value: "",
    type: "custom" as const,
  });

  useEffect(() => {
    if (existingItem) {
      setFormData({
        name: existingItem.name,
        description: existingItem.description || "",
        location: existingItem.location,
        quantity: existingItem.quantity,
        icon: existingItem.icon || "",
        color: existingItem.color || "#6366f1",
        isStorageItem: existingItem.isStorageItem || false,
      });
      setTags(existingItem.tags);
    } else {
      setFormData({
        name: "",
        description: "",
        location: "",
        quantity: 1,
        icon: "",
        color: "#6366f1",
        isStorageItem: false,
      });
      setTags([]);
    }
    setTagInput({ name: "", value: "", type: "custom" });
  }, [existingItem, open]);

  const handleAddTag = () => {
    if (!tagInput.name) {
      alert("Please enter a tag name");
      return;
    }

    // Validate tag values based on type
    if (tagInput.type === "price" && tagInput.value) {
      if (isNaN(parseFloat(tagInput.value))) {
        alert("Price must be a valid number");
        return;
      }
    }

    const newTag: ItemTag = {
      id: Date.now().toString(),
      name: tagInput.name,
      value: tagInput.value,
      type: tagInput.type,
    };
    setTags([...tags, newTag]);
    setTagInput({ name: "", value: "", type: "custom" });
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      location: formData.location,
      quantity: formData.quantity,
      icon: formData.icon || undefined,
      color: formData.color,
      isStorageItem: formData.isStorageItem,
      tags,
    });

    onOpenChange(false);
  };

  const getTagDisplay = (tag: ItemTag) => {
    if (tag.type === "price" && tag.value) {
      return `${tag.name}: $${tag.value}`;
    }
    if (tag.value) {
      return `${tag.name}: ${tag.value}`;
    }
    return tag.name;
  };

  const getLocationDisplayName = (locationName: string) => {
    if (!locationObjects || !getLocationPath) return locationName;

    const location = locationObjects.find((loc) => loc.name === locationName);
    if (!location) return locationName;

    return getLocationPath(location.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingItem ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Winter Jacket, Coffee Maker"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this item (color, brand, condition, etc.)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Item Icon</Label>
            <div className="flex gap-2 items-center">
              {formData.icon && (
                <div className="w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 p-1 flex items-center justify-center flex-shrink-0">
                  <img
                    src={getItemIconPath(formData.icon)}
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
                  <SelectValue placeholder="Choose an icon for this item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No icon</SelectItem>
                  {getItemIconOptions().map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <img
                          src={getItemIconPath(icon)}
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
            <Label htmlFor="color">Item Color</Label>
            <div className="flex gap-3 items-center">
              <div
                className="w-12 h-12 rounded-lg border-2 border-primary/30 cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: formData.color }}
              />
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-20 h-10 p-2 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Choose a color for this item and its icon</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData({ ...formData, location: value })
                }
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No locations available. Create one first!
                    </div>
                  ) : (
                    <>
                      {/* Storage Locations */}
                      {locations.filter((loc) => !storageItems.some((item) => item.name === loc)).length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">STORAGE LOCATIONS</div>
                          {locations
                            .filter((loc) => !storageItems.some((item) => item.name === loc))
                            .map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                📍 {getLocationDisplayName(loc)}
                              </SelectItem>
                            ))}
                        </>
                      )}

                      {/* Storage Items as Containers */}
                      {storageItems.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">CONTAINERS (ITEMS)</div>
                          {storageItems.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                              <div className="flex items-center gap-2">
                                {item.icon ? (
                                  <img
                                    src={getItemIconPath(item.icon)}
                                    alt={item.icon}
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <Box className="w-4 h-4" />
                                )}
                                <span>Inside: {item.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
          </div>

          {/* Storage Item Option */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Checkbox
              id="isStorageItem"
              checked={formData.isStorageItem}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isStorageItem: checked === true })
              }
            />
            <div className="flex-1">
              <Label htmlFor="isStorageItem" className="cursor-pointer font-semibold flex items-center gap-2">
                <Box className="w-4 h-4" />
                Make this a storage container
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Converting this item to a storage container will move it to the Storage page where you can organize items inside it. The icon you selected above will be displayed for this container.
              </p>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3 border-t pt-4">
            <Label>Tags & Attributes</Label>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Tag name"
                    value={tagInput.name}
                    onChange={(e) =>
                      setTagInput({ ...tagInput, name: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
                <Select
                  value={tagInput.type}
                  onValueChange={(value) =>
                    setTagInput({
                      ...tagInput,
                      type: value as any,
                    })
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={
                    tagInput.type === "price"
                      ? "0.00"
                      : tagInput.type === "importance"
                      ? "Low, Medium, High, Critical"
                      : "Value (optional)"
                  }
                  value={tagInput.value}
                  onChange={(e) =>
                    setTagInput({ ...tagInput, value: e.target.value })
                  }
                  className="text-sm"
                  type={tagInput.type === "price" ? "number" : "text"}
                  step={tagInput.type === "price" ? "0.01" : undefined}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  className="px-4"
                >
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    <span>{getTagDisplay(tag)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:opacity-60 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Suggestions */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
              <div>
                <strong>Tip:</strong> Use "Price" tags to track value, "Item Type" for categories, "Importance" for priority (Low/Medium/High/Critical)
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {existingItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
