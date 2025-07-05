import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skill = await prisma.skill.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        tasks: { orderBy: { createdAt: "asc" } },
        reflections: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Get skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = skillSchema.parse(body);

    const skill = await prisma.skill.updateMany({
      where: {
        id: params.id,
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
      where: { id: params.id },
      include: {
        tasks: true,
        reflections: true,
      },
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.skill.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
