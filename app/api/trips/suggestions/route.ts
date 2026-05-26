import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_SUGGESTIONS = [
  { id: "Paris, France", title: "Paris", desc: "Eiffel Tower & Louvre", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { id: "Tokyo, Japan", title: "Tokyo", desc: "Shinjuku & Mt. Fuji", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { id: "Rome, Italy", title: "Rome", desc: "Colosseum & Vatican", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
  { id: "New York, USA", title: "New York", desc: "Central Park & Broadway", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80" },
  { id: "Bali, Indonesia", title: "Bali", desc: "Beaches & Temples", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
  { id: "London, UK", title: "London", desc: "Big Ben & London Eye", image: "https://images.unsplash.com/photo-1513635269975-5969336cb1f3?auto=format&fit=crop&w=1200&q=80" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim() ?? "";

    if (!city) {
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    // Retrieve Groq API Key
    let apiKey = process.env.groq_api_key || process.env.GROQ_API_KEY;

    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const lines = envContent.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (
              trimmed.startsWith("groq_api_key:") ||
              trimmed.startsWith("groq_api_key=") ||
              trimmed.startsWith("GROQ_API_KEY:") ||
              trimmed.startsWith("GROQ_API_KEY=")
            ) {
              const match = trimmed.match(/^(?:groq_api_key|GROQ_API_KEY)[:=](.*)$/);
              if (match && match[1]) {
                apiKey = match[1].trim();
                apiKey = apiKey.replace(/^['"]|['"]$/g, "");
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error("Direct filesystem .env parsing fallback failed:", err);
      }
    }

    if (!apiKey) {
      console.warn("Groq API key not found. Using default suggestions.");
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const prompt = `You are a travel advisor. Provide exactly 6 popular tourist places to visit or activities to do in the city of "${city}".
Provide the output in pure JSON format as a list of objects with "title" and "desc" keys under a root "suggestions" key. "desc" should be a premium, brief 1-sentence overview (max 15 words) of that place.

Example format:
{
  "suggestions": [
    {"title": "Taj Mahal", "desc": "Stunning 17th-century white marble mausoleum on the Yamuna river."},
    {"title": "Agra Fort", "desc": "Massive red sandstone walled city that served as the Mughal capital."}
  ]
}`;

    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professional travel agent that outputs structured JSON lists of attractions." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    };

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      console.warn("Groq API request failed. Using default suggestions.");
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const parsed = JSON.parse(content);
    const rawSuggestions = parsed.suggestions || parsed;

    if (!Array.isArray(rawSuggestions)) {
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const finalSuggestions = rawSuggestions.slice(0, 6).map((item: any) => {
      const title = item.title || "";
      const desc = item.desc || "";
      
      // Clean tags: e.g. "Agra" & "Taj Mahal" -> tags "agra,taj,mahal"
      const cleanCity = city.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanTitle = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w: string) => w.length > 2)
        .join(",");
      
      const tags = cleanCity ? `${cleanCity},${cleanTitle}` : cleanTitle;

      return {
        id: `${title}, ${city}`,
        title,
        desc,
        image: `https://loremflickr.com/1200/800/${tags}/all`,
      };
    });

    return NextResponse.json({ suggestions: finalSuggestions });
  } catch (error) {
    console.error("Error generating dynamic city suggestions:", error);
    return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
  }
}
