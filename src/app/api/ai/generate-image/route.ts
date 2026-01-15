import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSlideImage } from "@/lib/gemini";
import { z } from "zod";

const generateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  slideId: z.string().optional(),
});

// POST /api/ai/generate-image - Generate background image for slide
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt } = validation.data;

    // Generate image using Gemini
    const imageUrl = await generateSlideImage(prompt);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate image. Please try again.",
      },
      { status: 500 }
    );
  }
}
