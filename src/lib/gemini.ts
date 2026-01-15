import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSlideImage(prompt: string): Promise<string> {
  try {
    // Using Gemini's image generation capabilities
    // Note: As of now, Gemini primarily does text generation
    // For actual image generation, you might want to use Imagen API
    // or integrate with another image generation service
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Enhance the prompt for better results
    const enhancedPrompt = `Create a detailed description for a professional presentation slide background image:
    
Original concept: ${prompt}

Describe the image in vivid detail including:
1. Main visual elements
2. Color palette and gradients
3. Composition and layout
4. Mood and atmosphere
5. Style (modern, minimalist, corporate, etc.)

This description will be used for image generation.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const enhancedDescription = response.text();
    
    // For now, return a placeholder URL
    // In production, you would:
    // 1. Use Google's Imagen API for actual image generation
    // 2. Or use another service like DALL-E, Midjourney API, etc.
    // 3. Store the generated image and return its URL
    
    // Placeholder: Generate a gradient background based on prompt analysis
    const colors = extractColorsFromPrompt(prompt);
    return generateGradientDataUrl(colors);
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    // Return a default gradient background
    return generateGradientDataUrl(["#3b82f6", "#1e40af"]);
  }
}

export async function generateSlideGraphics(
  slideContent: string,
  style: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Based on this slide content, suggest 3-5 simple icon or graphic descriptions that would enhance the visual appeal:

Content: ${slideContent}
Style: ${style}

Return a JSON array of strings, each describing a simple graphic or icon concept.
Example: ["lightbulb icon representing ideas", "upward arrow showing growth", "connected nodes for network"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error("Error generating graphics suggestions:", error);
    return [];
  }
}

export async function analyzeImageContent(imageBase64: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      "Analyze this image and describe its content in detail. Focus on what would be relevant for creating a presentation about this topic.",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "";
  }
}

export async function suggestSlideLayout(
  content: string,
  hasImage: boolean
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Based on this slide content, suggest the best layout:

Content: ${content}
Has image: ${hasImage}

Choose one of: "title", "titleAndContent", "twoColumn", "imageLeft", "imageRight", "fullImage"

Return ONLY the layout name, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const layout = response.text().trim().toLowerCase();
    
    const validLayouts = ["title", "titleandcontent", "twocolumn", "imageleft", "imageright", "fullimage"];
    if (validLayouts.includes(layout)) {
      // Convert to camelCase
      return layout.replace(/([a-z])([a-z]*)/g, (_, first, rest) => first + rest);
    }
    
    return hasImage ? "imageRight" : "titleAndContent";
  } catch (error) {
    console.error("Error suggesting layout:", error);
    return "titleAndContent";
  }
}

// Helper function to extract color suggestions from prompt
function extractColorsFromPrompt(prompt: string): string[] {
  const colorKeywords: Record<string, string[]> = {
    professional: ["#1e3a5f", "#2563eb"],
    creative: ["#7c3aed", "#ec4899"],
    nature: ["#059669", "#10b981"],
    warm: ["#f59e0b", "#ef4444"],
    cool: ["#0ea5e9", "#6366f1"],
    minimal: ["#374151", "#6b7280"],
    tech: ["#0f172a", "#3b82f6"],
    corporate: ["#1e40af", "#3b82f6"],
    modern: ["#18181b", "#a855f7"],
  };
  
  const promptLower = prompt.toLowerCase();
  
  for (const [keyword, colors] of Object.entries(colorKeywords)) {
    if (promptLower.includes(keyword)) {
      return colors;
    }
  }
  
  // Default professional blue gradient
  return ["#3b82f6", "#1e40af"];
}

// Generate a gradient background as data URL
function generateGradientDataUrl(colors: string[]): string {
  // Create an SVG gradient background
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// For future integration with actual image generation APIs
export async function generateImageWithImagen(prompt: string): Promise<string> {
  // Placeholder for Google Imagen API integration
  // When available, this would call the Imagen API
  // For now, return gradient background
  const colors = extractColorsFromPrompt(prompt);
  return generateGradientDataUrl(colors);
}
