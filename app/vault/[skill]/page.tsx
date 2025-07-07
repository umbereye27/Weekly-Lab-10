"use client";

import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Delete,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithAuth } from "@/utils/api";
import { useAuth } from "@/components/auth-provider";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  createdAt: string;
}

interface Reflection {
  id: string;
  content: string;
  mood?: string;
  createdAt: string;
}

interface Skill {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  tasks: Task[];
  reflections: Reflection[];
}

export default function SkillDetailPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchSkill = async () => {
      setLoading(true);
      try {
        const { skill: skillId } = await params;
        const res = await fetchWithAuth(`/api/skills/${skillId}`);
        console.log("res:", res);
        console.log(res.skill);
        setSkill(res.skill);
      } catch (error) {
        setSkill(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [params, isAuthenticated, authLoading]);

  useEffect(() => {
    const addSkills = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth("/api/skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(skill),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Skill added successfully:", data);
      } catch (error) {
        console.error("Error adding skill:", error);
      } finally {
        setLoading(false);
      }
    };

    addSkills();
  }, []);

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [taskFilter, setTaskFilter] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newReflection, setNewReflection] = useState("");
  const [reflectionMood, setReflectionMood] = useState("😊 Happy");

  const handleTaskToggle = (taskId: string) => {
    if (!skill) return;
    setSkill({
      ...skill,
      tasks: skill.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !skill) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: null,
      completed: false,
      dueDate: newTaskDueDate || undefined,
      priority: "medium",
      createdAt: new Date().toISOString(),
    };

    setSkill({
      ...skill,
      tasks: [...skill.tasks, newTask],
    });

    setNewTaskTitle("");
    setNewTaskDueDate("");
  };

  const handleAddReflection = () => {
    if (!newReflection.trim() || !skill) return;

    const reflection: Reflection = {
      id: Date.now().toString(),
      content: newReflection,
      mood: reflectionMood,
      createdAt: new Date().toISOString(),
    };

    setSkill({
      ...skill,
      reflections: [reflection, ...skill.reflections],
    });

    setNewReflection("");
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getMoodEmoji = (mood?: string) => {
    return mood?.split(" ")[0] || "😊";
  };

  const filteredTasks =
    skill?.tasks.filter((task) =>
      task.title.toLowerCase().includes(taskFilter.toLowerCase())
    ) || [];

  const completedTasks =
    skill?.tasks.filter((task) => task.completed).length || 0;
  const totalTasks = skill?.tasks.length || 0;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg">Loading skill details...</div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg">Skill not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/vault" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <nav className="text-sm text-slate-600">
              <Link href="/vault" className="hover:text-slate-900">
                Skills
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900">{skill.title}</span>
            </nav>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">JS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {skill.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {/* {skill.status.replace("_", " ")} */}
                  </Badge>
                  <span>Started 3 weeks ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 "
              >
                <Delete className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              Reflection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {skill.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skill.tasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                          />
                          <span
                            className={`flex-1 ${
                              task.completed
                                ? "line-through text-slate-500"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-slate-500">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completion</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Tasks</span>
                        <p className="font-medium">
                          {completedTasks}/{totalTasks}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Hours</span>
                        <p className="font-medium">40 hours</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-slate-500">Status</span>
                      <p className="font-medium text-green-600">64% complete</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Tasks</span>
                      <span className="font-medium">{totalTasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Completed</span>
                      <span className="font-medium text-green-600">
                        {completedTasks}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Reflections</span>
                      <span className="font-medium">
                        {skill.reflections.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Started</span>
                      <span className="font-medium">
                        {new Date(skill.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Task Form */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter task name"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-40"
                    placeholder="mm/dd/yyyy"
                  />
                  <Button onClick={handleAddTask} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Filter task name"
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <div className="flex-1">
                        <span
                          className={`block ${
                            task.completed
                              ? "line-through text-slate-500"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-slate-500">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            task.priority
                          )}`}
                        ></span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <Delete className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reflection" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Learning Reflections</CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reflection
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Reflection Form */}
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <Textarea
                    placeholder="Share your thoughts about the learning process..."
                    value={newReflection}
                    onChange={(e) => setNewReflection(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={reflectionMood}
                      onChange={(e) => setReflectionMood(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="😊 Happy">😊 Happy</option>
                      <option value="🤔 Confused">🤔 Confused</option>
                      <option value="😤 Frustrated">😤 Frustrated</option>
                      <option value="🎉 Excited">🎉 Excited</option>
                      <option value="😴 Tired">😴 Tired</option>
                    </select>
                    <Button onClick={handleAddReflection} size="sm">
                      Save Reflection
                    </Button>
                  </div>
                </div>

                {/* Reflections List */}
                <div className="space-y-4">
                  {skill.reflections.map((reflection) => (
                    <div
                      key={reflection.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {getMoodEmoji(reflection.mood)}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                reflection.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Delete className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {reflection.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
