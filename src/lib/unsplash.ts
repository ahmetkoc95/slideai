// Unsplash API integration for high-quality background images
// Free tier: 50 requests/hour

const UNSPLASH_API_URL = "https://api.unsplash.com";

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Search for photos on Unsplash based on keywords
 * Returns the URL of the best matching photo
 */
export async function searchUnsplashPhoto(
  keywords: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<string | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  const MAX_RETRIES = 1;

  if (!apiKey) {
    console.warn("[Unsplash] API key not configured, falling back to gradient");
    return null;
  }

  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      console.log("[Unsplash] Searching for:", keywords);
    
    // Clean up keywords for better search results
    const cleanKeywords = keywords
      .replace(/[^\w\s,]/g, "") // Remove special characters
      .split(",")
      .map(k => k.trim())
      .slice(0, 3) // Limit to 3 keywords
      .join(" ");

    const params = new URLSearchParams({
      query: cleanKeywords,
      orientation,
      per_page: "1",
      content_filter: "high", // High-quality, safe content
    });

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[Unsplash] Rate limited, using fallback");
        return null;
      }
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.warn("[Unsplash] Server error, retrying...");
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      console.error("[Unsplash] API error:", response.status);
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();

    if (data.results.length === 0) {
      console.log("[Unsplash] No results found for:", cleanKeywords);
      return null;
    }

    const photo = data.results[0];
    console.log("[Unsplash] Found photo by:", photo.user.name);

    // Return the regular size (1080px wide) which is good for slides
    // Add parameters for better slide backgrounds
    return `${photo.urls.regular}&w=1920&h=1080&fit=crop&auto=format`;
    } catch (error) {
      console.error("[Unsplash] Error:", error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      return null;
    }
  }

  return null;
}

/**
 * Get a random photo from Unsplash based on a topic
 * Useful as fallback when search doesn't return results
 */
export async function getRandomUnsplashPhoto(
  topic?: string
): Promise<string | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      orientation: "landscape",
      ...(topic && { query: topic }),
    });

    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const photo: UnsplashPhoto = await response.json();
    return `${photo.urls.regular}&w=1920&h=1080&fit=crop&auto=format`;
  } catch (error) {
    console.error("[Unsplash] Error getting random photo:", error);
    return null;
  }
}

/**
 * Generate topic-specific keywords for better image search
 */
export function generateImageKeywords(
  slideTitle: string,
  slideContent: string
): string {
  // Extract key concepts from title and content
  const combinedText = `${slideTitle} ${slideContent}`.toLowerCase();
  
  // Common presentation topics and their visual keywords
  const topicKeywords: Record<string, string[]> = {
    "ai": ["artificial intelligence", "technology", "neural network", "futuristic"],
    "artificial intelligence": ["ai technology", "machine learning", "robot", "digital brain"],
    "machine learning": ["data science", "algorithms", "neural network", "technology"],
    "business": ["corporate", "office", "teamwork", "professional"],
    "marketing": ["digital marketing", "social media", "advertising", "growth"],
    "finance": ["money", "investment", "charts", "banking"],
    "technology": ["tech", "digital", "innovation", "computer"],
    "health": ["healthcare", "medical", "wellness", "doctor"],
    "education": ["learning", "classroom", "books", "students"],
    "environment": ["nature", "sustainability", "green", "eco"],
    "startup": ["entrepreneurship", "innovation", "workspace", "team"],
    "data": ["analytics", "charts", "statistics", "visualization"],
    "cloud": ["cloud computing", "servers", "technology", "digital"],
    "security": ["cybersecurity", "protection", "lock", "digital security"],
    "introduction": ["beginning", "start", "welcome", "presentation"],
    "conclusion": ["summary", "ending", "finish", "results"],
    "future": ["futuristic", "innovation", "tomorrow", "vision"],
  };

  // Find matching topics
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (combinedText.includes(topic)) {
      return keywords.slice(0, 3).join(", ");
    }
  }

  // Default: extract nouns from title
  const words = slideTitle.split(" ").filter(w => w.length > 3);
  return words.slice(0, 3).join(", ") || "abstract, professional, modern";
}
