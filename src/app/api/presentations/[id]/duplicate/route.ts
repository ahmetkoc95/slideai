import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/presentations/[id]/duplicate - Duplicate a presentation
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get original presentation
    const original = await prisma.presentation.findFirst({
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

    if (!original) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    // Create duplicate
    const duplicate = await prisma.presentation.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        theme: original.theme as object,
        ownerId: session.user.id,
        slides: {
          create: original.slides.map((slide) => ({
            title: slide.title,
            content: slide.content as object,
            notes: slide.notes,
            backgroundUrl: slide.backgroundUrl,
            backgroundColor: slide.backgroundColor,
            templateId: slide.templateId,
            order: slide.order,
            transition: slide.transition,
          })),
        },
      },
      include: {
        slides: true,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
