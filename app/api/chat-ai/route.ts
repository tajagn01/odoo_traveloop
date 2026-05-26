import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUserId } from "@/lib/api-auth";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "Messages are required and must be an array." },
        { status: 400 }
      );
    }

    // Retrieve Groq API Key
    let apiKey = process.env.groq_api_key || process.env.GROQ_API_KEY;
    
    // Robust Fallback: Manually parse the .env file in the workspace directory 
    // to safeguard against typos such as colons (:) or spacing errors.
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
              // Extract the value after colon or equals sign
              const match = trimmed.match(/^(?:groq_api_key|GROQ_API_KEY)[:=](.*)$/);
              if (match && match[1]) {
                apiKey = match[1].trim();
                // Strip optional leading/trailing quotes
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
      console.error("Groq API Key (groq_api_key) is not configured in the environment.");
      return NextResponse.json(
        { message: "Groq API Key is not configured on the server. Please add 'groq_api_key' to your environment variables." },
        { status: 500 }
      );
    }

    // Prepare system instructions
    const systemPrompt = {
      role: "system",
      content: `You are Traveloop's premium AI Travel Planner. Your goal is to co-create a perfect multi-city travel itinerary with the user.
Be warm, professional, engaging, and extremely helpful.
Ask clarifying questions about their destination, dates, travel style, budget, and preferences if they haven't specified them yet.

When you have gathered enough details to build or finalize their itinerary, or if the user asks you to "finalize the trip", "make the trip", or "save the itinerary", you must do TWO things in your final response:
1. Present a beautiful, user-friendly, highly engaging itinerary overview in markdown, highlighting destinations, stops, hotel recommendations, and suggested activities per day.
2. At the very end of your response, output a structured JSON payload representing the trip wrapped inside a <trip_data> XML tag. This JSON will be parsed by the frontend to render an interactive "Make this Trip" button.

The JSON format inside <trip_data>...</trip_data> must match this schema exactly:
{
  "tripName": string, // Catchy and short name for the trip
  "description": string, // Short descriptive summary
  "startDate": "YYYY-MM-DD", // Start date of the trip (must match the first stop's arrivalDate)
  "endDate": "YYYY-MM-DD", // End date of the trip (must match the last stop's departureDate)
  "budgetLimit": number | null, // Estimated budget in USD, or null
  "stops": [
    {
      "cityName": string,
      "country": string,
      "arrivalDate": "YYYY-MM-DD",
      "departureDate": "YYYY-MM-DD",
      "hotelName": string | null, // Optional hotel recommendation
      "hotelCost": number | null, // Estimated hotel cost for the entire stay in this city, or null
      "transportCost": number | null, // Estimated transport cost to/in this city, or null
      "activities": [
        {
          "name": string,
          "description": string | null,
          "cost": number | null, // Estimated activity cost, or null
          "time": string | null // Suggested time, e.g. "09:00", "14:30", or null
        }
      ]
    }
  ]
}

Example output format:

Sure! Here is your custom 3-day itinerary for Paris:

### Day 1: Arrival & Louvre Museum
- **Morning**: Check into your hotel and rest.
- **Afternoon**: Walk around the beautiful Louvre Museum.

<trip_data>
{
  "tripName": "Paris Arts & History Tour",
  "description": "A beautiful 3-day exploration of Paris's finest museums and landmarks.",
  "startDate": "2026-06-01",
  "endDate": "2026-06-04",
  "budgetLimit": 1200,
  "stops": [
    {
      "cityName": "Paris",
      "country": "France",
      "arrivalDate": "2026-06-01",
      "departureDate": "2026-06-04",
      "hotelName": "Hotel Regina Louvre",
      "hotelCost": 450,
      "transportCost": 120,
      "activities": [
        {
          "name": "Louvre Museum Visit",
          "description": "Skip the line tour of the world-famous Louvre.",
          "cost": 45,
          "time": "14:30"
        }
      ]
    }
  ]
}
</trip_data>

CRITICAL RULES:
- The JSON inside <trip_data> must be perfectly valid JSON. Do not include markdown code ticks (\`\`\`) inside the <trip_data> tags.
- Make sure stop dates (arrivalDate and departureDate) correctly span the trip's startDate and endDate consecutively.
- Keep the tone highly motivating, premium, and friendly.`
    };

    // Construct the payload for Groq
    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [systemPrompt, ...messages],
      temperature: 0.3,
      max_tokens: 4096,
    };

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { message: `Groq API responded with an error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("Error in AI Chat API route:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
