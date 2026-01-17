import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeAndEnhanceContent } from "@/lib/deepseek";
import { generateSlideImage } from "@/lib/gemini";
import { searchUnsplashPhoto, generateImageKeywords } from "@/lib/unsplash";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { SlideContent, TextBlock, ProcessedSlide } from "@/types";
import { startProgress, updateProgress, completeProgress, failProgress } from "@/lib/progress-tracker";

const generateSlidesSchema = z.object({
  presentationId: z.string(),
  userInput: z.object({
    text: z.string().optional(),
    images: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
  }),
  slideCount: z.number().optional(),
});

// POST /api/ai/generate-slides - Generate full slides from user input
export async function POST(request: NextRequest) {
  console.log("[generate-slides] Starting request...");

  let progressPresentationId: string | null = null;

  try {
    const body = await request.json();
    progressPresentationId = body.presentationId || null;

    const session = await auth();

    if (!session?.user?.id) {
      console.log("[generate-slides] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = generateSlidesSchema.safeParse(body);

    if (!validation.success) {
      console.log("[generate-slides] Validation failed:", validation.error);
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { presentationId, userInput } = validation.data;
    console.log("[generate-slides] Processing for presentation:", presentationId);
    console.log("[generate-slides] User input text length:", userInput.text?.length || 0);

    startProgress(presentationId);
    updateProgress(presentationId, 1, "Analyzing your content...");

    // Verify presentation access
    const presentation = await prisma.presentation.findFirst({
      where: {
        id: presentationId,
        OR: [
          { ownerId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id, role: "editor" },
            },
          },
        ],
      },
    });

    if (!presentation) {
      console.log("[generate-slides] Presentation not found:", presentationId);
      return NextResponse.json(
        { error: "Presentation not found or access denied" },
        { status: 404 }
      );
    }

    console.log("[generate-slides] Calling DeepSeek API...");
    updateProgress(presentationId, 2, "AI is generating slide structure...");
    const processedContent = await analyzeAndEnhanceContent(userInput);
    console.log("[generate-slides] DeepSeek returned", processedContent.slides?.length || 0, "slides");

    updateProgress(presentationId, 3, "Creating visual elements...");

    const slidesData = await Promise.all(
      processedContent.slides.map(async (slideData: ProcessedSlide, index: number) => {
        // Generate background image - try Unsplash first, then Gemini gradient
        let backgroundUrl = null;
        
        // Get image keywords from DeepSeek response or generate from content
        const imageKeywords = slideData.imageKeywords ||
          generateImageKeywords(slideData.title, slideData.mainContent || "");

        updateProgress(presentationId, 4, "Fetching images for each slide...", { currentSlide: index + 1, totalSlides: processedContent.slides?.length });

        console.log(`[generate-slides] Slide ${index + 1}: Getting background for "${imageKeywords}"`);
        
        // Try Unsplash first for real photos
        try {
          backgroundUrl = await searchUnsplashPhoto(imageKeywords);
        } catch (error) {
          console.log("[generate-slides] Unsplash failed, trying Gemini gradient");
        }
        
        // Fallback to Gemini gradient if Unsplash didn't work
        if (!backgroundUrl && slideData.imagePrompt) {
          try {
            backgroundUrl = await generateSlideImage(slideData.imagePrompt);
          } catch (error) {
            console.error("Failed to generate gradient for slide:", error);
          }
        }

        // Create slide content structure based on layout type
        const elements: TextBlock[] = [];
        const isTitle = slideData.layout === "title";
        const theme = processedContent.suggestedTheme;

        // Title element - larger for title slides
        elements.push({
          id: uuidv4(),
          type: "text",
          content: slideData.title,
          x: isTitle ? 10 : 5,
          y: isTitle ? 35 : 8,
          width: isTitle ? 80 : 90,
          height: isTitle ? 20 : 12,
          fontSize: isTitle ? 48 : 32,
          fontWeight: "bold",
          fontFamily: theme?.fontFamily || "Inter",
          color: theme?.textColor || "#ffffff",
          textAlign: isTitle ? "center" : "left",
          animation: "fadeInDown",
        });

        // Subtitle for title slides
        if (isTitle && slideData.subtitle) {
          elements.push({
            id: uuidv4(),
            type: "text",
            content: slideData.subtitle,
            x: 10,
            y: 55,
            width: 80,
            height: 10,
            fontSize: 24,
            fontWeight: "normal",
            fontFamily: theme?.fontFamily || "Inter",
            color: theme?.textColor || "#ffffff",
            textAlign: "center",
            animation: "fadeIn",
          });
        }

        // For non-title slides: Add BOTH main content AND bullet points
        if (!isTitle) {
          let currentY = 22;

          // Main content paragraph (if exists)
          if (slideData.mainContent) {
            elements.push({
              id: uuidv4(),
              type: "text",
              content: slideData.mainContent,
              x: 5,
              y: currentY,
              width: 90,
              height: 25,
              fontSize: 18,
              fontWeight: "normal",
              fontFamily: theme?.fontFamily || "Inter",
              color: theme?.textColor || "#ffffff",
              textAlign: "left",
              animation: "fadeIn",
            });
            currentY += 28; // Move down after paragraph
          }

          // Bullet points (if exist)
          if (slideData.bulletPoints?.length) {
            slideData.bulletPoints.forEach((point, bulletIndex) => {
              elements.push({
                id: uuidv4(),
                type: "text",
                content: `• ${point}`,
                x: 5,
                y: currentY + bulletIndex * 10,
                width: 90,
                height: 8,
                fontSize: 20,
                fontWeight: "normal",
                fontFamily: theme?.fontFamily || "Inter",
                color: theme?.textColor || "#ffffff",
                textAlign: "left",
                animation: "fadeInUp",
              });
            });
          }
        }

        const content: SlideContent = { elements };

        return {
          title: slideData.title,
          content,
          backgroundUrl,
          backgroundColor: theme?.backgroundColor || "#1a1a2e",
          order: index,
          transition: index === 0 ? "fade" : "slide",
        };
      })
    );

    updateProgress(presentationId, 5, "Saving slides to database...");

    // Delete existing slides and create new ones
    await prisma.slide.deleteMany({
      where: { presentationId },
    });

    await prisma.slide.createMany({
      data: slidesData.map((slide) => ({
        ...slide,
        presentationId,
        content: slide.content as object,
      })),
    });

    // Update presentation theme if suggested
    if (processedContent.suggestedTheme) {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: {
          title: processedContent.title,
          theme: processedContent.suggestedTheme as object,
        },
      });
    }

    // Fetch updated presentation
    const updatedPresentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      include: {
        slides: {
          orderBy: { order: "asc" },
        },
      },
    });

    completeProgress(presentationId);

    return NextResponse.json({
      success: true,
      presentation: updatedPresentation,
    });
  } catch (error) {
    console.error("Error generating slides:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate slides. Please try again.";
    if (progressPresentationId) {
      failProgress(progressPresentationId, errorMessage);
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
