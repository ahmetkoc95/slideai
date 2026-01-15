import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPresentationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// GET /api/presentations - List user's presentations
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presentations = await prisma.presentation.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id },
            },
          },
        ],
      },
      include: {
        _count: {
          select: { slides: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      presentations.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        thumbnail: p.thumbnail,
        updatedAt: p.updatedAt,
        slidesCount: p._count.slides,
      }))
    );
  } catch (error) {
    console.error("Error fetching presentations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/presentations - Create new presentation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const presentation = await prisma.presentation.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        ownerId: session.user.id,
        slides: {
          create: [
            {
              title: "Title Slide",
              content: {
                elements: [
                  {
                    id: "title-1",
                    type: "text",
                    content: validation.data.title,
                    x: 50,
                    y: 40,
                    width: 80,
                    height: 20,
                    fontSize: 48,
                    fontWeight: "bold",
                    fontFamily: "Inter",
                    color: "#ffffff",
                    textAlign: "center",
                  },
                ],
              },
              order: 0,
              backgroundColor: "#3b82f6",
            },
          ],
        },
      },
      include: {
        slides: true,
      },
    });

    return NextResponse.json(presentation, { status: 201 });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
