import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reflectionSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt";

// GET a single reflection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reflectionId = params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reflection = await prisma.reflection.findFirst({
      where: {
        id: reflectionId,
        userId: user.id,
      },
      include: {
        skill: true,
      },
    });

    if (!reflection) {
      return NextResponse.json(
        { error: "Reflection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Reflection retrieved successfully",
      reflection,
    });
  } catch (error) {
    console.error("Get reflection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve reflection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// UPDATE a reflection by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reflectionId = params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the reflection exists and belongs to the user
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        id: reflectionId,
        userId: user.id,
      },
    });

    if (!existingReflection) {
      return NextResponse.json(
        { error: "Reflection not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, skillId } = reflectionSchema.parse({
      ...body,
      skillId: existingReflection.skillId, // Preserve the original skillId if not provided
    });

    // If skillId is provided, verify that it belongs to the user
    if (skillId && skillId !== existingReflection.skillId) {
      const skill = await prisma.skill.findFirst({
        where: {
          id: skillId,
          userId: user.id,
        },
      });

      if (!skill) {
        return NextResponse.json(
          { error: "Skill not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const updatedReflection = await prisma.reflection.update({
      where: {
        id: reflectionId,
      },
      data: {
        content,
        skillId: skillId || existingReflection.skillId,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json({
      message: "Reflection updated successfully",
      reflection: updatedReflection,
    });
  } catch (error) {
    console.error("Update reflection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update reflection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE a reflection by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reflectionId = params.id;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the reflection exists and belongs to the user
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        id: reflectionId,
        userId: user.id,
      },
    });

    if (!existingReflection) {
      return NextResponse.json(
        { error: "Reflection not found" },
        { status: 404 }
      );
    }

    await prisma.reflection.delete({
      where: {
        id: reflectionId,
      },
    });

    return NextResponse.json({
      message: "Reflection deleted successfully",
      reflectionId: reflectionId,
      status: "deleted",
    });
  } catch (error) {
    console.error("Delete reflection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete reflection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
