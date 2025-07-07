"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, CheckSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkillNavigationProps {
  skillId: string;
}

export function SkillNavigation({ skillId }: SkillNavigationProps) {
  const [skill, setSkill] = useState<{ title: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const response = await fetch(`/api/skills/${skillId}`);
        if (response.ok) {
          const data = await response.json();
          setSkill(data);
        }
      } catch (error) {
        console.error("Error fetching skill:", error);
      }
    };

    fetchSkill();
  }, [skillId]);

  const navItems = [
    {
      href: `/vault/${skillId}`,
      label: "Overview",
      icon: BookOpen,
    },
    {
      href: `/vault/${skillId}/tasks`,
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      href: `/vault/${skillId}/reflection`,
      label: "Reflection",
      icon: FileText,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vault">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Skills
          </Link>
        </Button>
        {skill && (
          <h1 className="text-2xl font-bold text-gray-900">{skill.title}</h1>
        )}
      </div>

      <nav className="flex gap-1 border-b">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
