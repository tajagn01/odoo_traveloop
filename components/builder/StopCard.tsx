"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StopData, useBuilderStore } from "@/lib/stores/useBuilderStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, MapPin, Building, Bed, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updateStopDetails, deleteStop } from "@/lib/actions/builder";
import { toast } from "sonner";
import { getPlaceImage } from "@/lib/images";
import { format } from "date-fns";

interface StopCardProps {
  stop: StopData;
  index: number;
}

export function StopCard({ stop, index }: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { updateStop } = useBuilderStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleUpdate = async (field: keyof StopData, value: any) => {
    updateStop(stop.id, { [field]: value });
    try {
      await updateStopDetails({ id: stop.id, [field]: value });
    } catch {
      toast.error("Failed to save changes");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this stop?")) return;
    try {
      await deleteStop(stop.id);
      toast.success("Stop removed");
    } catch {
      toast.error("Failed to remove stop");
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border-border/70 overflow-hidden shadow-sm transition-all ${
        isDragging ? "shadow-xl ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Drag Handle & Image */}
        <div className="flex md:w-1/3 w-full shrink-0 relative bg-muted h-32 md:h-auto">
          <div
            {...attributes}
            {...listeners}
            className="absolute left-2 top-2 z-10 p-1.5 bg-black/40 hover:bg-black/60 rounded-md cursor-grab active:cursor-grabbing text-white"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Stop {index + 1}
          </div>
          <img
            src={getPlaceImage(stop.cityName)}
            alt={stop.cityName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-bold flex items-center gap-1.5 line-clamp-1">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {stop.cityName}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1">{stop.country}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground">Arrival</Label>
              <Input
                type="date"
                className="h-8 text-sm mt-1"
                value={stop.arrivalDate ? format(new Date(stop.arrivalDate), "yyyy-MM-dd") : ""}
                onChange={(e) => handleUpdate("arrivalDate", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Departure</Label>
              <Input
                type="date"
                className="h-8 text-sm mt-1"
                value={stop.departureDate ? format(new Date(stop.departureDate), "yyyy-MM-dd") : ""}
                onChange={(e) => handleUpdate("departureDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" /> Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" /> Details & Costs
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Area */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" /> Accommodation
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Hotel Name</Label>
                  <Input
                    className="h-8 text-sm"
                    value={stop.hotelName || ""}
                    onChange={(e) => handleUpdate("hotelName", e.target.value)}
                    placeholder="E.g. Grand Plaza"
                  />
                </div>
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input
                    className="h-8 text-sm"
                    value={stop.hotelAddress || ""}
                    onChange={(e) => handleUpdate("hotelAddress", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" /> Budget Estimates
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Stay Cost ($)</Label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    value={stop.stayCost || ""}
                    onChange={(e) => handleUpdate("stayCost", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Local Transport ($)</Label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    value={stop.transportCost || ""}
                    onChange={(e) => handleUpdate("transportCost", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
