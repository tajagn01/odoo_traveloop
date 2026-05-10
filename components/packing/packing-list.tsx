"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Share2, RotateCcw, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["documents", "clothing", "electronics", "toiletries"];

type PackingItem = {
  id: string;
  itemName: string;
  category: string;
  isPacked: boolean;
};

type PackingListProps = {
  tripId: string;
  initialItems: PackingItem[];
};

export function PackingList({ tripId, initialItems }: PackingListProps) {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("category");
  const [sortBy, setSortBy] = useState("category");

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.isPacked).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const grouped = useMemo(() => {
    if (groupBy === "category") {
      return categories.map((categoryName) => ({
        label: categoryName,
        items: filteredItems.filter((item) => item.category === categoryName),
      }));
    } else if (groupBy === "status") {
      return [
        {
          label: "Packed",
          items: filteredItems.filter((item) => item.isPacked),
        },
        {
          label: "Not Packed",
          items: filteredItems.filter((item) => !item.isPacked),
        },
      ];
    }
    return [{ label: "All Items", items: filteredItems }];
  }, [filteredItems, groupBy]);

  const addItem = async () => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    const response = await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName, category }),
    });

    if (!response.ok) {
      toast.error("Unable to add item.");
      return;
    }

    const data = await response.json();
    setItems((prev) => [data.item, ...prev]);
    setItemName("");
    toast.success("Item added to packing list");
  };

  const toggleItem = async (item: PackingItem) => {
    const response = await fetch(`/api/packing/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPacked: !item.isPacked }),
    });

    if (!response.ok) {
      toast.error("Unable to update item.");
      return;
    }

    const data = await response.json();
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? data.item : entry)));
  };

  const deleteItem = async (itemId: string) => {
    const response = await fetch(`/api/packing/${itemId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to remove item.");
      return;
    }

    setItems((prev) => prev.filter((entry) => entry.id !== itemId));
    toast.success("Item removed");
  };

  const resetChecklist = async () => {
    const confirm = window.confirm("Reset all items to unpacked?");
    if (!confirm) return;

    await Promise.all(
      items.map((item) =>
        fetch(`/api/packing/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPacked: false }),
        })
      )
    );

    setItems((prev) => prev.map((item) => ({ ...item, isPacked: false })));
    toast.success("Checklist reset");
  };

  const shareChecklist = async () => {
    const checklistText = grouped
      .map(
        (group) =>
          `${group.label}\n${group.items.map((item) => `${item.isPacked ? "✓" : "○"} ${item.itemName}`).join("\n")}`
      )
      .join("\n\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Packing Checklist",
          text: checklistText,
        });
        toast.success("Checklist shared");
      } catch (error) {
        toast.error("Error sharing checklist");
      }
    } else {
      await navigator.clipboard.writeText(checklistText);
      toast.success("Checklist copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
              <SelectItem value="none">No Grouping</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress: {packedItems}/{totalItems} items packed</span>
              <span className="text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Form */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-foreground">Add item to checklist</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
            <Input
              placeholder="Enter item name..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Packing Items by Group */}
      <div className="space-y-4">
        {grouped.map(
          (group) =>
            group.items.length > 0 && (
              <Card key={group.label} className="border-border/70">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground capitalize">
                      {group.label}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {group.items.filter((i) => i.isPacked).length}/{group.items.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/50 p-3 hover:bg-muted/30 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={item.isPacked}
                          onCheckedChange={() => toggleItem(item)}
                          className="flex-shrink-0"
                        />
                        <span
                          className={`text-sm ${
                            item.isPacked
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          } truncate`}
                        >
                          {item.itemName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="flex-shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={resetChecklist}
          disabled={items.length === 0}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </Button>
        <Button
          variant="outline"
          onClick={shareChecklist}
          disabled={items.length === 0}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Checklist
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">No items in your packing list yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add items above to get started.</p>
        </div>
      )}
    </div>
  );
}
