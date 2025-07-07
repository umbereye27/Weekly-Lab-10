"use client";

import Link from "next/link";
import { Calendar, CheckCircle, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
  skill: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    _count: {
      tasks: number;
      reflections: number;
    };
  };
  progress: number;
  onDelete: (skillId: string) => void;
}

export function SkillCard({ skill, progress, onDelete }: SkillCardProps) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        const response = await fetch(`/api/skills/${skill.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          onDelete(skill.id);
        }
      } catch (error) {
        console.error("Error deleting skill:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link
              href={`/vault/${skill.id}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {skill.title}
            </Link>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Badge className={getStatusColor(skill.status)}>
          {skill.status.replace("_", " ")}
        </Badge>
      </CardHeader>
      <CardContent>
        {skill.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {skill.description}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>{skill._count.tasks} tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{skill._count.reflections} reflections</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              Created {new Date(skill.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
