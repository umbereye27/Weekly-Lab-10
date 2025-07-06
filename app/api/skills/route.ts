import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt"; // Update this import

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skills = await prisma.skill.findMany({
      where: { userId: user.id },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
            reflections: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = skillSchema.parse(body);

    const skill = await prisma.skill.create({
      data: {
        title,
        description,
        userId: user.id,
      },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
            reflections: true,
          },
        },
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
