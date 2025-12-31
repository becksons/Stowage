import { useState, useEffect } from "react";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorageLocation } from "@/hooks/useSupabaseStorage";
import { getStorageIconPath } from "@/lib/customIcons";

interface MoveStorageItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StorageLocation | null;
  allLocations: StorageLocation[];
  onMove: (parentId: string | null) => Promise<void>;
}

export default function MoveStorageItemDialog({
  open,
  onOpenChange,
  item,
  allLocations,
  onMove,
}: MoveStorageItemDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (item) {
      setSelectedParentId(item.parentId || null);
    }
  }, [item, open]);

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await onMove(selectedParentId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to move storage item:", error);
      alert("Failed to move storage item. Please try again.");
    } finally {
      setIsMoving(false);
    }
  };

  if (!item) return null;

  // Filter locations to show only root locations (no parent) or other containers
  // Also filter out the item itself
  const availableParents = allLocations.filter((loc) => loc.id !== item.id);
  const rootLocations = availableParents.filter((loc) => !loc.parentId);
  const otherParents = availableParents.filter((loc) => loc.parentId);

  const currentParent = item.parentId
    ? allLocations.find((loc) => loc.id === item.parentId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Storage Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
              {item.icon ? (
                <img
                  src={getStorageIconPath(item.icon)}
                  alt={item.icon}
                  className="w-6 h-6"
                />
              ) : (
                <Box className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentParent
                  ? `Inside: ${currentParent.name}`
                  : "Root location"}
              </p>
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="parent-location">Move to Location</Label>
            <Select
              value={selectedParentId || "root"}
              onValueChange={(value) =>
                setSelectedParentId(value === "root" ? null : value)
              }
            >
              <SelectTrigger id="parent-location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">📍 Root (No parent)</SelectItem>

                {rootLocations.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      MAIN LOCATIONS
                    </div>
                    {rootLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.icon ? (
                          <img
                            src={getStorageIconPath(loc.icon)}
                            alt={loc.icon}
                            className="w-4 h-4 inline mr-2"
                          />
                        ) : null}
                        {loc.name}
                      </SelectItem>
                    ))}
                  </>
                )}

                {otherParents.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      NESTED LOCATIONS
                    </div>
                    {otherParents.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.icon ? (
                          <img
                            src={getStorageIconPath(loc.icon)}
                            alt={loc.icon}
                            className="w-4 h-4 inline mr-2"
                          />
                        ) : null}
                        {loc.name}
                      </SelectItem>
                    ))}
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
              disabled={isMoving || selectedParentId === item.parentId}
            >
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
