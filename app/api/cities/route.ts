import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Filter out bands, songs, albums, actors, etc.
function isGeographical(textToScan: string, title: string): boolean {
  const desc = textToScan.toLowerCase();
  const t = title.toLowerCase();
  
  const excludeWords = [
    "band", "album", "song", "singer", "actor", "actress", 
    "personality", "film", "movie", "novel", "book", "track", 
    "musical", "company", "brand", "game", "character", "footballer",
    "cricketer", "politician", "writer", "poet", "artist", "dynasty",
    "episode", "television", "series", "discography", "videography",
    "pop group", "rock group", "duo"
  ];
  
  // Exclude titles containing parenthesized media categories e.g. XYZ (band)
  if (t.includes("(") && t.includes(")")) {
    const parenthesized = t.substring(t.indexOf("(") + 1, t.indexOf(")")).trim();
    if (excludeWords.some((w) => parenthesized.includes(w))) {
      return false;
    }
  }

  // Exclude if description text contains any entertainment media terms
  if (excludeWords.some((w) => desc.includes(w))) {
    return false;
  }
  
  const includeWords = [
    "city", "town", "capital", "municipality", "district", "commune", 
    "department", "province", "country", "island", "village", "state", 
    "region", "metropolis", "settlement", "locality", "prefecture", 
    "territory", "nation", "place", "oasis", "peninsula", "archipelago", 
    "suburb", "city-state"
  ];
  
  if (includeWords.some((w) => desc.includes(w))) {
    return true;
  }
  
  if (desc.includes("capital of") || desc.includes("in ") || desc.includes("of the")) {
    return true;
  }

  // If it has parentheses but no geographical keywords, filter it out as noise
  if (t.includes("(")) {
    return false;
  }

  return true;
}

// Fetch top tourist attractions for a city
async function fetchPlacesToVisit(cityName: string): Promise<string[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent("tourist attractions in " + cityName)}&utf8=&format=json&limit=5`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "TraveloopTravelPlanner/1.0 (contact@traveloop.local; traveloop.local)",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const searchResults = data.query?.search || [];
    
    const landmarks = searchResults
      .map((item: any) => item.title)
      .filter((title: string) => {
        const t = title.toLowerCase();
        return (
          !t.includes("list of") &&
          !t.includes("tourism in") &&
          !t.includes("history of") &&
          !t.includes("geography of") &&
          t !== cityName.toLowerCase()
        );
      })
      .slice(0, 4);

    return landmarks.length > 0
      ? landmarks
      : ["Historic Center", "Scenic Viewpoints", "Local Markets", "Cultural Landmarks"];
  } catch (err) {
    console.error(`Failed to fetch places to visit for ${cityName}:`, err);
    return ["Historic Center", "Scenic Viewpoints", "Local Markets", "Cultural Landmarks"];
  }
}

// Wikipedia API helper to fetch page summary from the internet
async function fetchWikiSummary(title: string): Promise<any> {
  try {
    const formattedTitle = title.replace(/ /g, "_");
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedTitle)}`;
    const response = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "TraveloopTravelPlanner/1.0 (contact@traveloop.local; traveloop.local)",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.type === "standard" || data.type === "disambiguation") {
      const cityName = data.title;
      const description = data.extract || "";
      const wikiDesc = data.description || "";
      
      // Filter out unwanted media pages by scanning combined description and extracts
      const textToScan = `${wikiDesc} ${description}`;
      if (!isGeographical(textToScan, cityName)) {
        return null;
      }

      // Attempt to resolve the country name from Wikipedia's description metadata
      let countryName = "Global";
      const descLower = wikiDesc.toLowerCase();
      
      if (wikiDesc.includes("in ")) {
        countryName = wikiDesc.substring(wikiDesc.lastIndexOf("in ") + 3).trim();
      } else if (descLower.includes("capital of ")) {
        countryName = wikiDesc.substring(wikiDesc.lastIndexOf("capital of ") + 11).trim();
      } else if (descLower.includes("city of ")) {
        countryName = wikiDesc.substring(wikiDesc.lastIndexOf("city of ") + 8).trim();
      } else if (data.description) {
        countryName = data.description;
      }
      
      // Clean up punctuation and capitalize
      countryName = countryName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
      countryName = countryName.replace(/\b\w/g, (c) => c.toUpperCase());
      
      // Safe fallback if resolving failed
      if (countryName.length < 2 || countryName.toLowerCase() === "city" || countryName.toLowerCase() === "town") {
        countryName = "Global";
      }

      const placesToVisit = await fetchPlacesToVisit(cityName);

      const cleanTags = cityName.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).join(",");
      return {
        cityName,
        country: countryName,
        region: "Global",
        description,
        thumbnail: `https://loremflickr.com/1200/800/${cleanTags},travel/all`,
        placesToVisit,
      };
    }
    return null;
  } catch (err) {
    console.error(`Wikipedia REST summary request failed for ${title}:`, err);
    return null;
  }
}

const POPULAR_CITIES = [
  "Paris",
  "Tokyo",
  "London",
  "New York City",
  "Rome",
  "Mumbai",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() ?? "";
    const countryFilter = searchParams.get("country")?.trim() ?? "";

    let rawResults: any[] = [];

    // 1. Prepend Custom Exact Search Result
    if (query) {
      const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
      
      const cleanTags = capitalizedQuery.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).join(",");
      rawResults.push({
        id: `temp__${encodeURIComponent(capitalizedQuery)}__Global`,
        cityName: capitalizedQuery,
        country: "Global",
        region: "Custom",
        costIndex: 50,
        popularity: 90,
        description: `Explore the gorgeous sights, local landmarks, and popular attractions in ${capitalizedQuery}. A premium custom destination for your travel itinerary.`,
        thumbnail: `https://loremflickr.com/1200/800/${cleanTags},travel/all`,
        placesToVisit: ["Scenic Spots", "Local Markets", "Cultural Landmarks", "Historic Sites"],
      });
    }

    // 2. Load popular cities or Search Wikipedia
    if (!query) {
      const summaries = await Promise.all(
        POPULAR_CITIES.map((name) => fetchWikiSummary(name))
      );
      
      const populars = summaries
        .filter(Boolean)
        .map((city, idx) => ({
          id: `temp__${encodeURIComponent(city.cityName)}__${encodeURIComponent(city.country)}`,
          cityName: city.cityName,
          country: city.country,
          region: city.region,
          costIndex: 40 + (idx % 3) * 20,
          popularity: 95 - idx * 3,
          description: city.description,
          thumbnail: city.thumbnail,
          placesToVisit: city.placesToVisit,
        }));
      rawResults.push(...populars);
    } else {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          "User-Agent": "TraveloopTravelPlanner/1.0 (contact@traveloop.local; traveloop.local)",
        },
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const titles = searchData[1] || [];
        
        if (titles.length > 0) {
          const summaries = await Promise.all(
            titles.map((title: string) => fetchWikiSummary(title))
          );
          
          const searchMatches = summaries
            .filter(Boolean)
            .map((city, idx) => ({
              id: `temp__${encodeURIComponent(city.cityName)}__${encodeURIComponent(city.country)}`,
              cityName: city.cityName,
              country: city.country,
              region: city.region,
              costIndex: 50,
              popularity: 85 - idx * 2,
              description: city.description,
              thumbnail: city.thumbnail,
              placesToVisit: city.placesToVisit,
            }));
          
          // Avoid duplicates with the exact prepended search query
          const filteredMatches = searchMatches.filter(
            (match) => match.cityName.toLowerCase() !== query.toLowerCase()
          );

          rawResults.push(...filteredMatches);
        }
      }
    }

    // 3. Client Filter: Filter results by country if specified
    if (countryFilter) {
      rawResults = rawResults.filter((city) =>
        city.country.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    return NextResponse.json({ results: rawResults });
  } catch (error: any) {
    console.error("Error in cities search API:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
