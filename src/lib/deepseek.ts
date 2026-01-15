import { ProcessedContent, ProcessedSlide, UserInput } from "@/types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
  console.log("[DeepSeek] Starting API call...");
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("[DeepSeek] API key is missing!");
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    console.log("[DeepSeek] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DeepSeek] API error:", response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    console.log("[DeepSeek] API call successful, got response");
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("[DeepSeek] Fetch error:", error);
    throw error;
  }
}

export async function analyzeAndEnhanceContent(
  input: UserInput
): Promise<ProcessedContent> {
  const systemPrompt = `You are an expert presentation designer and storytelling strategist. Transform user input into a visually stunning, content-rich presentation.

CRITICAL REQUIREMENTS:
1. Create ENGAGING slide titles that tell a story (not generic titles)
2. Each slide MUST have BOTH:
   - "mainContent": A detailed paragraph (50-100 words) explaining the concept with context, examples, or insights
   - "bulletPoints": 3-5 key takeaways (each 8-15 words, NOT just 3-4 words)
3. Use VARIED slide types:
   - First slide: "title" layout (presentation title + subtitle)
   - Middle slides: Mix of "titleAndContent", "imageLeft", "imageRight" layouts
   - Last slide: Summary/conclusion with key takeaways
4. Generate VIVID image search keywords for each slide (for finding relevant photos)
5. Create a cohesive narrative flow from introduction to conclusion

SLIDE TYPES TO USE:
- "title": Opening slide with big title and subtitle
- "titleAndContent": Main content slides with paragraph + bullets
- "imageLeft"/"imageRight": Visual slides where image is prominent
- "fullImage": Impactful visual-only slides for transitions

Return JSON with this EXACT structure:
{
  "title": "Compelling Presentation Title",
  "slides": [
    {
      "title": "Engaging Slide Title",
      "subtitle": "Optional subtitle for title slides",
      "mainContent": "A detailed paragraph (50-100 words) that explains the concept, provides context, uses examples or analogies, and engages the audience. This should NOT be empty.",
      "bulletPoints": ["Key takeaway with enough detail to be meaningful (8-15 words)", "Another detailed point", "Third important point"],
      "imageKeywords": "specific, relevant, photo search terms",
      "layout": "titleAndContent"
    }
  ],
  "suggestedTheme": {
    "primaryColor": "#hex (vibrant, topic-appropriate)",
    "secondaryColor": "#hex (complementary)",
    "backgroundColor": "#1a1a2e (dark for contrast)",
    "textColor": "#ffffff",
    "fontFamily": "Inter"
  }
}`;

  const userContent = `Create a STUNNING, CONTENT-RICH presentation about:

${input.text || "No text provided"}

${input.links?.length ? `Reference these URLs for additional context: ${input.links.join(", ")}` : ""}

${input.images?.length ? `Include ${input.images.length} user-provided images` : ""}

IMPORTANT:
- Generate 6-10 slides with DETAILED content (not bullet points only)
- Each slide needs a PARAGRAPH of explanation (50-100 words) PLUS bullet points
- Make it visually engaging with varied layouts
- Include specific image search keywords for each slide
- Tell a compelling story from start to finish`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);

  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    return JSON.parse(jsonMatch[0]) as ProcessedContent;
  } catch (error) {
    console.error("Failed to parse DeepSeek response:", error);
    throw new Error("Failed to process content with AI");
  }
}

export async function generateSlideContent(
  slideTitle: string,
  context: string,
  slideIndex: number,
  totalSlides: number
): Promise<ProcessedSlide> {
  const systemPrompt = `You are a presentation content expert. Generate detailed content for a single slide based on the title and context provided.

Return a JSON object with:
{
  "title": "Refined slide title",
  "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "mainContent": "Optional paragraph of supporting text",
  "imagePrompt": "Detailed prompt for generating a relevant background image - be specific about style, mood, colors, and subjects",
  "layout": "titleAndContent"
}`;

  const userContent = `Generate content for slide ${slideIndex + 1} of ${totalSlides}.
Title: ${slideTitle}
Context: ${context}

Make the content engaging, professional, and visually oriented.`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    return JSON.parse(jsonMatch[0]) as ProcessedSlide;
  } catch (error) {
    console.error("Failed to parse slide content:", error);
    return {
      title: slideTitle,
      bulletPoints: [],
      layout: "titleAndContent",
    };
  }
}

export async function generateImagePrompt(
  slideTitle: string,
  slideContent: string,
  presentationTheme: string
): Promise<string> {
  const systemPrompt = `You are an expert at creating image generation prompts. Create a detailed, visually descriptive prompt for generating a professional presentation background or illustration.

Guidelines:
- Focus on abstract, professional imagery
- Include color preferences that match the theme
- Specify style (modern, minimalist, corporate, creative, etc.)
- Describe lighting, mood, and composition
- Keep it suitable for a professional context
- Make it work as a background with text overlay

Return ONLY the prompt text, no JSON or additional formatting.`;

  const userContent = `Create an image generation prompt for a slide with:
Title: ${slideTitle}
Content: ${slideContent}
Theme: ${presentationTheme}

The image should work as a slide background with good contrast for text.`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);

  return response.trim();
}

export async function determineSlideCont(
  content: string,
  userPreference?: number
): Promise<number> {
  if (userPreference && userPreference > 0) {
    return Math.min(Math.max(userPreference, 3), 20);
  }

  const systemPrompt = `You are a presentation expert. Based on the content provided, determine the optimal number of slides for a professional presentation.

Consider:
- Amount of content to cover
- Logical groupings of information
- Attention span of audience
- Need for intro and conclusion slides

Return ONLY a number between 3 and 20.`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Determine optimal slide count for: ${content}` },
  ]);

  const count = parseInt(response.trim(), 10);
  return isNaN(count) ? 5 : Math.min(Math.max(count, 3), 20);
}
