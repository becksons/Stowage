import { useState, useEffect } from "react";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColorizedIcon from "@/components/ColorizedIcon";
import { InventoryItem } from "@/hooks/useSupabaseInventory";
import { StorageLocation } from "@/hooks/useSupabaseStorage";
import { getItemIconPath } from "@/lib/customIcons";

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  locations: string[];
  locationObjects?: StorageLocation[];
  storageItems?: any[];
  onMove: (location: string) => Promise<void>;
}

export default function MoveItemDialog({
  open,
  onOpenChange,
  item,
  locations,
  locationObjects = [],
  storageItems = [],
  onMove,
}: MoveItemDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (item) {
      setSelectedLocation(item.location);
    }
  }, [item, open]);

  const handleMove = async () => {
    if (!selectedLocation) {
      alert("Please select a location");
      return;
    }

    if (selectedLocation === item?.location) {
      onOpenChange(false);
      return;
    }

    setIsMoving(true);
    try {
      await onMove(selectedLocation);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to move item:", error);
      alert("Failed to move item. Please try again.");
    } finally {
      setIsMoving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            {item.icon ? (
              <ColorizedIcon
                iconName={item.icon}
                hue={item.color ? parseInt(item.color.replace("#", ""), 16) % 360 : 0}
                className="w-10 h-10"
              />
            ) : (
              <Box className="w-10 h-10" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Currently in: {item.location}</p>
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="new-location">Move to Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="new-location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No locations available
                  </div>
                ) : (
                  <>
                    {/* Storage Locations */}
                    {locations.filter((loc) => !storageItems.some((si) => si.name === loc)).length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          STORAGE LOCATIONS
                        </div>
                        {locations
                          .filter((loc) => !storageItems.some((si) => si.name === loc))
                          .map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              📍 {loc}
                            </SelectItem>
                          ))}
                      </>
                    )}

                    {/* Storage Items as Containers */}
                    {storageItems.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          CONTAINERS (ITEMS)
                        </div>
                        {storageItems.map((storageItem) => (
                          <SelectItem key={storageItem.name} value={storageItem.name}>
                            <div className="flex items-center gap-2">
                              {storageItem.icon ? (
                                <img
                                  src={getItemIconPath(storageItem.icon)}
                                  alt={storageItem.icon}
                                  className="w-4 h-4"
                                />
                              ) : (
                                <Box className="w-4 h-4" />
                              )}
                              <span>Inside: {storageItem.name}</span>
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

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={isMoving || !selectedLocation || selectedLocation === item.location}
            >
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
