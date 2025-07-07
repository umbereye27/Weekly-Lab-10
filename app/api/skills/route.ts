import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations";
import { getUserFromToken } from "@/lib/jwt"; // Update this import

export async function GET(request: NextRequest) {
  try {
    // console.log("Skills API - GET request received");

    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log("Request headers:", JSON.stringify(headers, null, 2));

    // Get user from token
    const user = getUserFromToken(request);

    // For development only - use a mock user if authentication fails
    if (!user) {
      console.error("Skills API - Authentication failed");

      if (
        process.env.NODE_ENV === "development" &&
        process.env.BYPASS_AUTH === "true"
      ) {
        console.warn("⚠️ Using mock user for development");
        const mockSkills = [
          {
            id: "mock-skill-1",
            title: "Mock Skill 1",
            description: "This is a mock skill for development",
            createdAt: new Date().toISOString(),
            // userId removed for security
            tasks: [],
            reflections: [],
            _count: {
              tasks: 0,
              reflections: 0,
            },
          },
        ];

        return NextResponse.json({
          message: "DEVELOPMENT MODE: Mock skills retrieved",
          skills: mockSkills,
        });
      }

      return NextResponse.json(
        {
          error: "Unauthorized",
          details: "No valid authentication token provided",
        },
        { status: 401 }
      );
    }

    const skills = await prisma.skill.findMany({
      // where: { userId: user.id },
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

    // Remove userId from each skill in the response
    const sanitizedSkills = skills.map((skill) => {
      const { userId, ...skillWithoutUserId } = skill;
      return skillWithoutUserId;
    });

    return NextResponse.json({
      message: "Skills retrieved successfully",
      skills: sanitizedSkills,
    });
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve skills",
        details: error instanceof Error ? error.message : String(error),
      },
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

    // Remove userId from the response
    const { userId, ...skillWithoutUserId } = skill;

    return NextResponse.json(
      {
        message: "Skill created successfully",
        skill: skillWithoutUserId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create skill",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
