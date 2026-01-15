import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeAndEnhanceContent, determineSlideCont } from "@/lib/deepseek";
import { z } from "zod";

const analyzeSchema = z.object({
  text: z.string().optional(),
  images: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  slideCount: z.number().optional(),
});

// POST /api/ai/analyze - Analyze user input and generate presentation structure
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { text, images, links, slideCount } = validation.data;

    if (!text && !images?.length && !links?.length) {
      return NextResponse.json(
        { error: "Please provide some content to analyze" },
        { status: 400 }
      );
    }

    // Determine optimal slide count
    const optimalSlideCount = await determineSlideCont(text || "", slideCount);

    // Analyze and enhance content
    const processedContent = await analyzeAndEnhanceContent({
      text,
      images,
      links,
    });

    // Ensure we have the right number of slides
    if (processedContent.slides.length > optimalSlideCount) {
      processedContent.slides = processedContent.slides.slice(0, optimalSlideCount);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...processedContent,
        slideCount: optimalSlideCount,
      },
    });
  } catch (error) {
    console.error("Error analyzing content:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to analyze content. Please try again." 
      },
      { status: 500 }
    );
  }
}
