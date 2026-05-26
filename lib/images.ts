export const cityImages: Record<string, string> = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-5969336cb1f3?auto=format&fit=crop&w=1200&q=80",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-15d0a47ebc51?auto=format&fit=crop&w=1200&q=80",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  "Istanbul": "https://images.unsplash.com/photo-1522230554523-7fa50df1d856?auto=format&fit=crop&w=1200&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
  "Cape Town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
  "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "Venice": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
};

const fallbacks = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80", // generic landscape
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80", // boat & lake
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80", // mountains
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", // roadtrip
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80", // snowy peaks
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80", // plane
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // beach
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80", // city street
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", // mountain mist
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80", // ocean coast
];

export const getPlaceImage = (name: string, type: 'city' | 'activity' = 'city') => {
  if (!name) return fallbacks[0];

  // Try exact match or partial match
  for (const [key, value] of Object.entries(cityImages)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Dynamic LoremFlickr search for gorgeous live travel images!
  const cleanTags = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).join(",");
  return `https://loremflickr.com/1200/800/${cleanTags},travel/all`;
};
