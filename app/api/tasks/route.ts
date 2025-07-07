import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    const skillId = request.nextUrl.searchParams.get("skillId");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        skillId: skillId || undefined,
        skill: {
          userId: user.id,
        },
      },
      include: {
        skill: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve tasks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    console.log("User found in the api: ", user);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, skillId } = taskSchema.parse(body);

    // Verify that the skill belongs to the user
    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
      },
    });
    console.log("Found skill: ", skill);
    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found or unauthorized" },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        skillId,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create task",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
