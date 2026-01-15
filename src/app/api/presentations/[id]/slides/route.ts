import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSlidesSchema = z.object({
  slides: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.object({}).passthrough(),
      notes: z.string().nullable().optional(),
      backgroundUrl: z.string().nullable().optional(),
      backgroundColor: z.string().nullable().optional(),
      templateId: z.string().nullable().optional(),
      order: z.number(),
      transition: z.string().optional(),
    })
  ),
});

// PUT /api/presentations/[id]/slides - Update all slides
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access
    const presentation = await prisma.presentation.findFirst({
      where: {
        id,
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

    const body = await request.json();
    const validation = updateSlidesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { slides } = validation.data;

    // Use transaction to update all slides
    await prisma.$transaction(async (tx) => {
      // Delete slides that are not in the update (if any were removed)
      const slideIds = slides.filter((s) => !s.id.startsWith("temp-")).map((s) => s.id);
      await tx.slide.deleteMany({
        where: {
          presentationId: id,
          id: { notIn: slideIds },
        },
      });

      // Update or create each slide
      for (const slideData of slides) {
        if (slideData.id.startsWith("temp-")) {
          // Create new slide
          await tx.slide.create({
            data: {
              title: slideData.title,
              content: slideData.content as object,
              notes: slideData.notes,
              backgroundUrl: slideData.backgroundUrl,
              backgroundColor: slideData.backgroundColor,
              templateId: slideData.templateId,
              order: slideData.order,
              transition: slideData.transition || "fade",
              presentationId: id,
            },
          });
        } else {
          // Update existing slide
          await tx.slide.update({
            where: { id: slideData.id },
            data: {
              title: slideData.title,
              content: slideData.content as object,
              notes: slideData.notes,
              backgroundUrl: slideData.backgroundUrl,
              backgroundColor: slideData.backgroundColor,
              templateId: slideData.templateId,
              order: slideData.order,
              transition: slideData.transition,
            },
          });
        }
      }
    });

    // Fetch updated slides
    const updatedSlides = await prisma.slide.findMany({
      where: { presentationId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(updatedSlides);
  } catch (error) {
    console.error("Error updating slides:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
