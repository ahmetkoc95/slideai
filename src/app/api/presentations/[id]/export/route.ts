import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PptxGenJS from "pptxgenjs";
import { SlideContent, TextBlock, ImageBlock } from "@/types";

// POST /api/presentations/[id]/export - Export presentation to PPTX
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch presentation with slides
    const presentation = await prisma.presentation.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.user.id },
          { isPublic: true },
          {
            collaborators: {
              some: { userId: session.user.id },
            },
          },
        ],
      },
      include: {
        slides: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    // Create PPTX
    const pptx = new PptxGenJS();
    pptx.title = presentation.title;
    pptx.author = session.user.name || "SlideAI User";
    pptx.company = "SlideAI";

    // Process each slide
    for (const slideData of presentation.slides) {
      const slide = pptx.addSlide();
      const content = slideData.content as unknown as SlideContent;

      // Set background
      if (slideData.backgroundUrl) {
        // For data URLs or external URLs
        if (slideData.backgroundUrl.startsWith("data:")) {
          slide.background = { data: slideData.backgroundUrl };
        } else {
          slide.background = { path: slideData.backgroundUrl };
        }
      } else if (slideData.backgroundColor) {
        slide.background = { color: slideData.backgroundColor.replace("#", "") };
      }

      // Add elements
      if (content?.elements) {
        for (const element of content.elements) {
          if (element.type === "text") {
            const textEl = element as TextBlock;
            slide.addText(textEl.content, {
              x: `${textEl.x}%`,
              y: `${textEl.y}%`,
              w: `${textEl.width}%`,
              h: `${textEl.height}%`,
              fontSize: Math.round(textEl.fontSize * 0.75), // Convert px to pt
              bold: textEl.fontWeight === "bold",
              fontFace: textEl.fontFamily || "Arial",
              color: textEl.color.replace("#", ""),
              align: textEl.textAlign === "center" ? "center" : textEl.textAlign === "right" ? "right" : "left",
              valign: "middle",
            });
          } else if (element.type === "image") {
            const imgEl = element as ImageBlock;
            if (imgEl.src.startsWith("data:")) {
              slide.addImage({
                data: imgEl.src,
                x: `${imgEl.x}%`,
                y: `${imgEl.y}%`,
                w: `${imgEl.width}%`,
                h: `${imgEl.height}%`,
              });
            } else {
              slide.addImage({
                path: imgEl.src,
                x: `${imgEl.x}%`,
                y: `${imgEl.y}%`,
                w: `${imgEl.width}%`,
                h: `${imgEl.height}%`,
              });
            }
          }
        }
      }

      // Add speaker notes if available
      if (slideData.notes) {
        slide.addNotes(slideData.notes);
      }
    }

    // Generate PPTX buffer
    const buffer = await pptx.write({ outputType: "arraybuffer" });

    // Return as downloadable file
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${presentation.title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting presentation:", error);
    return NextResponse.json(
      { error: "Failed to export presentation" },
      { status: 500 }
    );
  }
}
