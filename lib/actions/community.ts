"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchCommunityFeed(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const posts = await prisma.communityPost.findMany({
    skip,
    take: limit,
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          creatorProfile: true,
        },
      },
      trip: {
        include: {
          stops: {
            orderBy: { stopOrder: "asc" },
            include: { activities: true },
          },
        },
      },
      _count: {
        select: { likes: true, bookmarks: true, copies: true },
      },
    },
  });

  return posts;
}

export async function publishTrip(tripId: string, meta: { title: string; description: string; coverImage: string; tags: string[] }) {
  const session = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });

  if (!trip) {
    throw new Error("Trip not found or unauthorized.");
  }

  // Ensure trip is public
  await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic: true },
  });

  const post = await prisma.communityPost.create({
    data: {
      authorId: session.user.id,
      tripId,
      title: meta.title,
      description: meta.description,
      coverImage: meta.coverImage,
      tags: meta.tags,
    },
  });

  revalidatePath("/community");
  return post;
}

export async function toggleLike(postId: string) {
  const session = await requireAuth();

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, postId },
    });
  }

  revalidatePath("/community");
  return { liked: !existing };
}

export async function toggleBookmark(postId: string) {
  const session = await requireAuth();

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: { userId: session.user.id, postId },
    });
  }

  revalidatePath("/community");
  return { bookmarked: !existing };
}

export async function copyTrip(postId: string) {
  const session = await requireAuth();

  // 1. Fetch original post and deep trip data
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      trip: {
        include: {
          stops: {
            include: { activities: true, departingTransport: true, arrivingTransport: true, notes: true },
          },
          expenses: true,
          packingItems: true,
          notes: true,
        },
      },
    },
  });

  if (!post || !post.trip) {
    throw new Error("Post or trip not found");
  }

  const originalTrip = post.trip;

  // 2. Start a transaction to ensure consistent copy
  const newTrip = await prisma.$transaction(async (tx) => {
    // Create new Trip
    const clonedTrip = await tx.trip.create({
      data: {
        userId: session.user.id,
        tripName: `${originalTrip.tripName} (Copy)`,
        description: originalTrip.description,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        coverPhoto: originalTrip.coverPhoto,
        isPublic: false,
        budgetLimit: originalTrip.budgetLimit,
      },
    });

    // Create tracking record
    await tx.tripCopy.create({
      data: {
        originalPostId: postId,
        newTripId: clonedTrip.id,
        copiedById: session.user.id,
      },
    });

    // Copy stops and activities
    // Note: To map old stop IDs to new ones for transport segments, we keep a map
    const stopIdMap = new Map<string, string>();

    for (const oldStop of originalTrip.stops) {
      const newStop = await tx.stop.create({
        data: {
          tripId: clonedTrip.id,
          cityId: oldStop.cityId,
          cityName: oldStop.cityName,
          country: oldStop.country,
          arrivalDate: oldStop.arrivalDate,
          departureDate: oldStop.departureDate,
          stopOrder: oldStop.stopOrder,
          hotelName: oldStop.hotelName,
          hotelAddress: oldStop.hotelAddress,
          bookingReference: oldStop.bookingReference,
          stayCost: oldStop.stayCost,
          transportCost: oldStop.transportCost,
          miscCost: oldStop.miscCost,
        },
      });

      stopIdMap.set(oldStop.id, newStop.id);

      // Copy activities for this stop
      if (oldStop.activities.length > 0) {
        await tx.activity.createMany({
          data: oldStop.activities.map((a) => ({
            cityId: a.cityId,
            stopId: newStop.id,
            activityName: a.activityName,
            description: a.description,
            activityType: a.activityType,
            duration: a.duration,
            cost: a.cost,
            imageUrl: a.imageUrl,
            rating: a.rating,
            bestTime: a.bestTime,
            scheduledDay: a.scheduledDay,
            scheduledTime: a.scheduledTime,
          })),
        });
      }
    }

    return clonedTrip;
  });

  revalidatePath("/community");
  revalidatePath("/dashboard");
  
  return newTrip;
}
