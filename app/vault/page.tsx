"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, CheckCircle, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CreateSkillDialog } from "@/components/vault/create-skill-dialog";
import { Skill, Task, Reflection, ActivityItem } from "@/type/index";
import { useAuth } from "@/components/auth-provider";
import { fetchWithAuth } from "@/utils/api";
import { DashboardSidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { OverViewCard } from "@/components/OverViewCard";

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksCount, setTasksCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentReflections, setRecentReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      router.push("/auth/signin");
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchSkills(),
          fetchRecentTasks(),
          fetchRecentReflections(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, authLoading, router]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchWithAuth("/api/skills");
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load skills"
      );

      if (
        error instanceof Error &&
        error.message.includes("session has expired")
      ) {
        router.push("/auth/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const data = await fetchWithAuth("/api/tasks");
      setTasksCount(data.tasks.length);
      setRecentTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
    }
  };

  const fetchRecentReflections = async () => {
    try {
      const data = await fetchWithAuth("/api/reflections");
      setRecentReflections(data.reflections || []);
    } catch (error) {
      console.error("Error fetching recent reflections:", error);
    }
  };

  const handleSkillCreated = async (newSkill: Skill) => {
    setSkills([newSkill, ...skills]);
    setShowCreateDialog(false);
    await fetchSkills();
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">
            Error loading dashboard
          </div>
          <div className="text-slate-400 mb-4">{error}</div>
          <Button
            onClick={fetchSkills}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalSkills = skills.length;
  const completedSkills = 0;
  const inProgressSkills = 0;
  const totalTasks = skills.reduce(
    (acc, skill) => acc + (skill.tasks?.length || 0),
    0
  );

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    return matchesSearch;
  });

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      <div className="ml-64 p-8">
        <DashboardHeader
          onSearch={(query) => setSearchQuery(query)}
          onAddSkill={() => setShowCreateDialog(true)}
        />
        <OverViewCard
          totalSkills={totalSkills}
          completedSkills={completedSkills}
          inProgressSkills={inProgressSkills}
          totalTasks={totalTasks}
        />

        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Skills</h2>
            <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="All Categories">All Categories</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>

          {filteredSkills.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchQuery ? "No skills found" : "Add New Skill"}
                </h3>
                <p className="text-slate-400 mb-4">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Start tracking a new learning goal"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Skill
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredSkills.slice(0, 3).map((skill) => (
                <Card
                  key={skill.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">
                          <Link
                            href={`/vault/${skill.id}`}
                            className="hover:text-indigo-400 transition-colors"
                          >
                            {skill.title}
                          </Link>
                        </CardTitle>
                        <Badge
                          className={`text-xs ${getStatusColor(skill.status)}`}
                        >
                          Active
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {skill.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">
                            {/* % */}
                          </span>
                        </div>
                        <Progress className="h-2 bg-slate-700" />
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>{skill.tasks?.length ?? 0} tasks</span>
                        <span>
                          Started{" "}
                          {new Date(skill.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-slate-800 border-slate-700 border-dashed hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent
                  className="p-8 text-center"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Add New Skill</h3>
                  <p className="text-slate-400 text-sm">
                    Start tracking a new learning goal
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <CreateSkillDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSkillCreated={handleSkillCreated}
      />
    </div>
  );
}
