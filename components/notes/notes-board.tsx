"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

type Note = {
  id: string;
  noteContent: string;
  createdAt: string;
  stopId: string | null;
  stop?: { cityName: string } | null;
};

type Stop = {
  id: string;
  cityName: string;
  country: string;
};

type NotesBoardProps = {
  tripId: string;
  initialNotes: Note[];
  stops: Stop[];
};

export function NotesBoard({ tripId, initialNotes, stops }: NotesBoardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [noteContent, setNoteContent] = useState("");
  const [stopId, setStopId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const addNote = async () => {
    if (!noteContent.trim()) return;
    const response = await fetch(`/api/trips/${tripId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteContent, stopId }),
    });

    if (!response.ok) {
      toast.error("Unable to add note.");
      return;
    }

    const data = await response.json();
    setNotes((prev) => [data.note, ...prev]);
    setNoteContent("");
    setStopId(null);
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingContent(note.noteContent);
  };

  const saveEdit = async (noteId: string) => {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteContent: editingContent }),
    });

    if (!response.ok) {
      toast.error("Unable to update note.");
      return;
    }

    const data = await response.json();
    setNotes((prev) => prev.map((note) => (note.id === noteId ? data.note : note)));
    setEditingId(null);
    setEditingContent("");
  };

  const deleteNote = async (noteId: string) => {
    const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete note.");
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add a note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Stop (optional)</Label>
            <Select value={stopId ?? "all"} onValueChange={(value) => setStopId(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Trip-level note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Trip-level note</SelectItem>
                {stops.map((stop) => (
                  <SelectItem key={stop.id} value={stop.id}>
                    {stop.cityName}, {stop.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="noteContent">Note</Label>
            <Textarea
              id="noteContent"
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Add quick reminders, contact info, or daily highlights."
            />
          </div>
          <Button onClick={addNote}>Add note</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id} className="border-border/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">
                {note.stop?.cityName ? `Stop: ${note.stop.cityName}` : "Trip note"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => saveEdit(note.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{note.noteContent}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(note)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!notes.length ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No notes yet. Add your first reminder.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
