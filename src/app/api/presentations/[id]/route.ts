import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePresentationSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/presentations/[id] - Get single presentation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(presentation);
  } catch (error) {
    console.error("Error fetching presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/presentations/[id] - Update presentation
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
    const existing = await prisma.presentation.findFirst({
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

    if (!existing) {
      return NextResponse.json(
        { error: "Presentation not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updatePresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: {
      title?: string;
      description?: string;
      theme?: object;
      isPublic?: boolean;
    } = {};
    
    if (validation.data.title !== undefined) updateData.title = validation.data.title;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.theme !== undefined) updateData.theme = validation.data.theme as object;
    if (validation.data.isPublic !== undefined) updateData.isPublic = validation.data.isPublic;
    
    const presentation = await prisma.presentation.update({
      where: { id },
      data: updateData,
      include: {
        slides: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(presentation);
  } catch (error) {
    console.error("Error updating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/presentations/[id] - Delete presentation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owner can delete
    const existing = await prisma.presentation.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Presentation not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.presentation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
