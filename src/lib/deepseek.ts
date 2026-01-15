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
  const systemPrompt = `You are an expert presentation designer and content strategist. Your task is to analyze raw user input and transform it into a well-structured, professional presentation outline.

Guidelines:
1. Create clear, concise slide titles
2. Organize content logically with a clear narrative flow
3. Suggest appropriate layouts for each slide
4. Generate image prompts for visuals that would enhance each slide
5. Keep bullet points brief and impactful
6. Ensure the presentation has a strong opening and closing

Return your response as a valid JSON object with this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "bulletPoints": ["Point 1", "Point 2"],
      "mainContent": "Optional longer text content",
      "imagePrompt": "Descriptive prompt for background/image generation",
      "layout": "title|titleAndContent|twoColumn|imageLeft|imageRight|fullImage"
    }
  ],
  "suggestedTheme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontFamily": "Font Name"
  }
}`;

  const userContent = `Please analyze and structure the following content for a professional presentation:

${input.text || "No text provided"}

${input.links?.length ? `Referenced URLs: ${input.links.join(", ")}` : ""}

${input.images?.length ? `Number of images provided: ${input.images.length}` : ""}

Create a compelling presentation structure with appropriate slides, layouts, and image prompts for each slide.`;

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
