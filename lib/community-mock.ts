export type CommunityMockPost = {
  id: string;
  title: string;
  coverImage: string;
  author: {
    name: string;
    image: string | null;
  };
  trip: {
    id: string;
    budgetLimit: number | null;
  };
  durationDays: number;
  destinations: string[];
  likes: number;
  bookmarks: number;
};

const titles = [
  "12-Day Japan Rail Journey", "Mediterranean Slow Travel Route", "Bali Workation With Beach Stops",
  "Iceland Ring Road Adventure", "Swiss Alps Hiking Trail", "Parisian Art & Cafe Tour",
  "Amalfi Coast Escape", "Santorini Sunset Voyage", "Patagonia Glaciers Trek",
  "Kyoto Temple Stay", "New York City Heights", "London Royal Walk",
  "Barcelona Gothic Quarter", "Rome Culinary Masterclass", "Norway Fjords Cruise",
  "Prague Old Town Wanderer", "Vienna Classical Music Trip", "Budapest Thermal Bath Guide",
  "Lisbon Tram Adventure", "Amsterdam Canal Living"
];

const authors = [
  "Aarav Mehta", "Maya Sharma", "Noah Patel", "Avery Park", "Liam Smith", "Emma Wilson",
  "Sophia Chen", "Lucas Brown", "Olivia Garcia", "Ethan Miller", "Mila Kunis", "Ryan Gosling",
  "Emma Stone", "Brad Pitt", "Angelina Jolie", "Tom Cruise", "Zendaya", "Donald Glover",
  "Billie Eilish", "Harry Styles"
];

const images = [
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
  "https://images.unsplash.com/photo-1515542622106-78b28af78158",
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
  "https://images.unsplash.com/photo-1476610182048-b716b8518aae",
  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
  "https://images.unsplash.com/photo-1583531172005-814191b8b6c0",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
  "https://images.unsplash.com/photo-1541943181603-d8fe267a5dcf",
  "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
  "https://images.unsplash.com/photo-1503917988258-f87a78e3c995",
  "https://images.unsplash.com/photo-1548126466-4470dfdafa28",
  "https://images.unsplash.com/photo-1468436139062-f60a71c5c892"
];

export const COMMUNITY_MOCK_COUNT = titles.length;

const destinations = ["Tokyo", "Paris", "London", "Rome", "Bali"];
const avatarImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
];

export function getFeaturedItineraries(): CommunityMockPost[] {
  return Array.from({ length: COMMUNITY_MOCK_COUNT }).map((_, i) => ({
    id: `community-post-${i + 1}`,
    title: titles[i],
    coverImage: `${images[i]}?auto=format&fit=crop&w=1200&q=80`,
    author: {
      name: authors[i],
      image: `${avatarImages[i % avatarImages.length]}?auto=format&fit=crop&w=100&q=80`,
    },
    trip: {
      id: `trip-mock-${i}`,
      budgetLimit: Math.floor(Math.random() * 5000) + 1000,
    },
    durationDays: Math.floor(Math.random() * 10) + 5,
    destinations: destinations.slice(0, Math.floor(Math.random() * 3) + 1),
    likes: Math.floor(Math.random() * 500) + 50,
    bookmarks: Math.floor(Math.random() * 200) + 20,
  }));
}
