import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, ItemTag } from "@/hooks/useInventory";

interface AddItemDialogProps {
  locations: string[];
  onAdd: (item: Omit<InventoryItem, "id" | "createdAt">) => void;
}

export default function AddItemDialog({ locations, onAdd }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    quantity: 1,
  });
  const [tags, setTags] = useState<ItemTag[]>([]);
  const [tagInput, setTagInput] = useState({
    name: "",
    value: "",
    type: "custom" as const,
  });

  const handleAddTag = () => {
    if (tagInput.name) {
      const newTag: ItemTag = {
        id: Date.now().toString(),
        ...tagInput,
      };
      setTags([...tags, newTag]);
      setTagInput({ name: "", value: "", type: "custom" });
    }
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

    onAdd({
      name: formData.name,
      description: formData.description,
      location: formData.location,
      quantity: formData.quantity,
      tags,
    });

    setFormData({ name: "", description: "", location: "", quantity: 1 });
    setTags([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Item</span>
      </Button>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Winter jacket"
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
              placeholder="Add notes about this item..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none"
            />
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
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
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
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3 border-t pt-4">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Tag name (e.g., Price)"
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
                    type: value as "type" | "importance" | "price" | "custom",
                  })
                }
              >
                <SelectTrigger className="w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="importance">Importance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Value (optional)"
                value={tagInput.value}
                onChange={(e) =>
                  setTagInput({ ...tagInput, value: e.target.value })
                }
                className="text-sm"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="px-3"
              >
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span>
                      {tag.name}
                      {tag.value && `: ${tag.value}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:text-primary/60"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
