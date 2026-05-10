"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["clothing", "documents", "electronics", "toiletries"];

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

  const grouped = useMemo(() => {
    return categories.map((categoryName) => ({
      category: categoryName,
      items: items.filter((item) => item.category === categoryName),
    }));
  }, [items]);

  const addItem = async () => {
    if (!itemName.trim()) return;
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
  };

  const resetChecklist = async () => {
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
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add an item</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[2fr_1fr_auto]">
          <div>
            <Label htmlFor="itemName">Item name</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="Passport holder"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addItem}>Add item</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Packing checklist</h2>
        <Button variant="outline" onClick={resetChecklist}>
          Reset checklist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map((group) => (
          <Card key={group.category} className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold capitalize">
                {group.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.length ? (
                group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={item.isPacked}
                        onCheckedChange={() => toggleItem(item)}
                      />
                      <span className={item.isPacked ? "line-through" : ""}>
                        {item.itemName}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No items in this category yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
