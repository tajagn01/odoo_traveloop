"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  CalendarRange,
  Wallet,
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { ActivitySearch } from "@/components/itinerary/activity-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SectionActivity = {
  id: string;
  activityName: string;
  description: string | null;
  activityType: string;
  duration: number;
  cost: number;
  imageUrl: string | null;
};

export type ItinerarySection = {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  stopOrder: number;
  activities: SectionActivity[];
};

type Props = {
  tripId: string;
  sections: ItinerarySection[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function totalCost(activities: SectionActivity[]) {
  return activities.reduce((sum, a) => sum + a.cost, 0);
}

/* ------------------------------------------------------------------ */
/* Add-section inline form                                             */
/* ------------------------------------------------------------------ */

function AddSectionRow({ tripId }: { tripId: string }) {
  const today = new Date().toLocaleDateString('en-CA');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cityName: "",
    country: "",
    arrivalDate: "",
    departureDate: "",
  });

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const submit = async () => {
    if (!form.cityName || !form.country || !form.arrivalDate || !form.departureDate) {
      toast.error("Fill in all section details.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Unable to add section."); return; }
    toast.success("Section added.");
    setForm({ cityName: "", country: "", arrivalDate: "", departureDate: "" });
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        id="add-itinerary-section-btn"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
        Add another Section
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-foreground">New Section</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="new-city">City / Destination</Label>
          <Input id="new-city" placeholder="Paris" {...field("cityName")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-country">Country</Label>
          <Input id="new-country" placeholder="France" {...field("country")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-arrival">Start date</Label>
          <Input id="new-arrival" type="date" min={today} {...field("arrivalDate")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-departure">End date</Label>
          <Input id="new-departure" type="date" min={today} {...field("departureDate")} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={submit} disabled={loading} size="sm">
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {loading ? "Saving…" : "Save section"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single section card                                                 */
/* ------------------------------------------------------------------ */

function SectionCard({
  section,
  index,
  isFirst,
  isLast,
}: {
  section: ItinerarySection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const today = new Date().toLocaleDateString('en-CA');
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    cityName: section.cityName,
    country: section.country,
    arrivalDate: section.arrivalDate.slice(0, 10),
    departureDate: section.departureDate.slice(0, 10),
  });

  const field = (key: keyof typeof editForm) => ({
    value: editForm[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const saveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/stops/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { toast.error("Unable to update section."); return; }
    toast.success("Section updated.");
    setEditing(false);
    router.refresh();
  };

  const deleteSection = async () => {
    const res = await fetch(`/api/stops/${section.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Unable to delete section."); return; }
    toast.success("Section removed.");
    router.refresh();
  };

  const reorder = async (dir: "up" | "down") => {
    await fetch(`/api/stops/${section.id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction: dir }),
    });
    router.refresh();
  };

  const deleteActivity = async (id: string) => {
    const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Unable to remove activity."); return; }
    toast.success("Activity removed.");
    router.refresh();
  };

  const budget = totalCost(section.activities);

  return (
    <div
      id={`section-card-${section.id}`}
      className="rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* ── header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-4">
        {/* section number badge */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <span className="truncate text-base font-semibold text-foreground">
            {section.cityName}, {section.country}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5 shrink-0" />
            {fmt(section.arrivalDate)} → {fmt(section.departureDate)}
            {budget > 0 && (
              <>
                <span className="mx-1 text-border">·</span>
                <Wallet className="h-3.5 w-3.5 shrink-0" />
                ${budget.toFixed(0)} budget
              </>
            )}
          </span>
        </div>

        {/* actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => reorder("up")}
            disabled={isFirst}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => reorder("down")}
            disabled={isLast}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Edit section"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={deleteSection}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
            title="Delete section"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── edit form ── */}
      {editing && (
        <form onSubmit={saveEdit} className="grid gap-4 border-b border-border/60 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>City</Label>
            <Input {...field("cityName")} required />
          </div>
          <div className="space-y-1">
            <Label>Country</Label>
            <Input {...field("country")} required />
          </div>
          <div className="space-y-1">
            <Label>Start date</Label>
            <Input type="date" min={today} {...field("arrivalDate")} required />
          </div>
          <div className="space-y-1">
            <Label>End date</Label>
            <Input type="date" min={today} {...field("departureDate")} required />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* ── body ── */}
      {expanded && (
        <div className="space-y-5 p-5">
          {/* section info */}
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Section info
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              All the necessary information about this section. This can be anything like time
              section, hotel or any other activity.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <CalendarRange className="h-3 w-3" />
                {fmt(section.arrivalDate)} → {fmt(section.departureDate)}
              </span>
              {budget > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  Budget: ${budget.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* activities list */}
          {section.activities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Activities ({section.activities.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group relative flex flex-col gap-1 rounded-xl border border-border bg-background/70 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-foreground">{activity.activityName}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.activityType} · {activity.duration}h · ${activity.cost}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                    )}
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="absolute right-2 top-2 hidden rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-500 group-hover:block"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* activity search */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Add activities
            </p>
            <ActivitySearch stopId={section.id} cityId={section.cityId} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main export                                                         */
/* ------------------------------------------------------------------ */

export function ItinerarySectionBuilder({ tripId, sections }: Props) {
  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-semibold text-foreground">No sections yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first destination below to start building the itinerary.
          </p>
        </div>
      )}

      {sections.map((section, i) => (
        <SectionCard
          key={section.id}
          section={section}
          index={i}
          isFirst={i === 0}
          isLast={i === sections.length - 1}
        />
      ))}

      <AddSectionRow tripId={tripId} />
    </div>
  );
}
