"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTaskDialog } from "@/components/vault/create-task-dialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
}

export default function TasksPage({ params }: { params: { skill: string } }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [params.skill]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/skills/${params.skill}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          )
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setTasks(tasks.filter((task) => task.id !== taskId));
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowCreateDialog(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-600 mb-4">
              Break down your learning into manageable tasks
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      handleTaskToggle(task.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTaskDelete(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        skillId={params.skill}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
