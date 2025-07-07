import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = await params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skill = await prisma.skill.findFirst({
      where: { id: skillId },
      include: {
        tasks: { orderBy: { createdAt: "asc" } },
        reflections: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Skill retrieved successfully",
      skill,
    });
  } catch (error) {
    console.error("Get skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve skill",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = skillSchema.parse(body);

    const skill = await prisma.skill.updateMany({
      where: {
        id: skillId,
        userId: user.id,
      },
      data: {
        title,
        description,
      },
    });

    if (skill.count === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const updatedSkill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        tasks: true,
        reflections: true,
      },
    });

    return NextResponse.json({
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update skill",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.skill.deleteMany({
      where: {
        id: skillId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Skill deleted successfully",
      skillId: skillId,
      status: "deleted",
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete skill",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
