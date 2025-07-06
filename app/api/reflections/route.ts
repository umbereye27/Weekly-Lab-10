import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reflectionSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, skillId } = reflectionSchema.parse(body);

    // Verify skill belongs to user
    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId: user.id,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const reflection = await prisma.reflection.create({
      data: {
        content,
        skillId,
        userId: user.id,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(
      {
        message: "Reflection created successfully",
        reflection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create reflection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create reflection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    const skillId = request.nextUrl.searchParams.get("skillId");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reflections = await prisma.reflection.findMany({
      where: {
        skillId: skillId || undefined,
        userId: user.id,
      },
      include: {
        skill: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Reflections retrieved successfully",
      reflections,
    });
  } catch (error) {
    console.error("Get reflections error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve reflections",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
