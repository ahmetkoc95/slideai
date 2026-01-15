import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeAndEnhanceContent } from "@/lib/deepseek";
import { generateSlideImage } from "@/lib/gemini";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { SlideContent, TextBlock } from "@/types";

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
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = generateSlidesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { presentationId, userInput } = validation.data;

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
      return NextResponse.json(
        { error: "Presentation not found or access denied" },
        { status: 404 }
      );
    }

    // Analyze content with DeepSeek
    const processedContent = await analyzeAndEnhanceContent(userInput);

    // Generate slides with backgrounds
    const slidesData = await Promise.all(
      processedContent.slides.map(async (slideData, index) => {
        // Generate background image
        let backgroundUrl = null;
        if (slideData.imagePrompt) {
          try {
            backgroundUrl = await generateSlideImage(slideData.imagePrompt);
          } catch (error) {
            console.error("Failed to generate image for slide:", error);
          }
        }

        // Create slide content structure
        const elements: TextBlock[] = [];

        // Title element
        elements.push({
          id: uuidv4(),
          type: "text",
          content: slideData.title,
          x: 5,
          y: 10,
          width: 90,
          height: 15,
          fontSize: 36,
          fontWeight: "bold",
          fontFamily: processedContent.suggestedTheme?.fontFamily || "Inter",
          color: processedContent.suggestedTheme?.textColor || "#ffffff",
          textAlign: "left",
          animation: "fadeInDown",
        });

        // Bullet points or main content
        if (slideData.bulletPoints?.length) {
          slideData.bulletPoints.forEach((point, bulletIndex) => {
            elements.push({
              id: uuidv4(),
              type: "text",
              content: `• ${point}`,
              x: 5,
              y: 30 + bulletIndex * 12,
              width: 90,
              height: 10,
              fontSize: 24,
              fontWeight: "normal",
              fontFamily: processedContent.suggestedTheme?.fontFamily || "Inter",
              color: processedContent.suggestedTheme?.textColor || "#ffffff",
              textAlign: "left",
              animation: "fadeInUp",
            });
          });
        } else if (slideData.mainContent) {
          elements.push({
            id: uuidv4(),
            type: "text",
            content: slideData.mainContent,
            x: 5,
            y: 30,
            width: 90,
            height: 50,
            fontSize: 20,
            fontWeight: "normal",
            fontFamily: processedContent.suggestedTheme?.fontFamily || "Inter",
            color: processedContent.suggestedTheme?.textColor || "#ffffff",
            textAlign: "left",
            animation: "fadeIn",
          });
        }

        const content: SlideContent = { elements };

        return {
          title: slideData.title,
          content,
          backgroundUrl,
          backgroundColor:
            processedContent.suggestedTheme?.backgroundColor || "#1e40af",
          order: index,
          transition: index === 0 ? "fade" : "slide",
        };
      })
    );

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

    return NextResponse.json({
      success: true,
      presentation: updatedPresentation,
    });
  } catch (error) {
    console.error("Error generating slides:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate slides. Please try again.",
      },
      { status: 500 }
    );
  }
}
