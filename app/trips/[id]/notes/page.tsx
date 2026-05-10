import { AppShell } from "@/components/layout/app-shell";
import { NotesBoard } from "@/components/notes/notes-board";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      notes: { include: { stop: true }, orderBy: { createdAt: "desc" } },
      stops: true,
    },
  });

  if (!trip) {
    return (
      <AppShell title="Notes" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const notes = trip.notes.map((note: {
    id: string;
    noteContent: string;
    createdAt: Date;
    stopId: string | null;
    stop: { cityName: string } | null;
  }) => ({
    id: note.id,
    noteContent: note.noteContent,
    createdAt: note.createdAt.toISOString(),
    stopId: note.stopId,
    stop: note.stop ? { cityName: note.stop.cityName } : null,
  }));

  const stops = trip.stops.map((stop: { id: string; cityName: string; country: string }) => ({
    id: stop.id,
    cityName: stop.cityName,
    country: stop.country,
  }));

  return (
    <AppShell
      title={`Notes: ${trip.tripName}`}
      description="Capture reminders and daily highlights."
    >
      <NotesBoard tripId={trip.id} initialNotes={notes} stops={stops} />
    </AppShell>
  );
}
