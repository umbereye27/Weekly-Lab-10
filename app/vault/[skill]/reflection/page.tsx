"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateReflectionDialog } from "@/components/vault/create-reflection-dialog";

interface Reflection {
  id: string;
  content: string;
  createdAt: string;
}

export default function ReflectionPage({
  params,
}: {
  params: { skill: string };
}) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchReflections();
  }, [params.skill]);

  const fetchReflections = async () => {
    try {
      const response = await fetch(`/api/skills/${params.skill}`);
      if (response.ok) {
        const data = await response.json();
        setReflections(data.reflections);
      }
    } catch (error) {
      console.error("Error fetching reflections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReflectionCreated = (newReflection: Reflection) => {
    setReflections([newReflection, ...reflections]);
    setShowCreateDialog(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading reflections...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Reflection</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reflection
        </Button>
      </div>

      {reflections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reflections yet
            </h3>
            <p className="text-gray-600 mb-4">
              Document your learning journey and insights
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Reflection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reflections.map((reflection) => (
            <Card key={reflection.id}>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">
                  {new Date(reflection.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{reflection.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateReflectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        skillId={params.skill}
        onReflectionCreated={handleReflectionCreated}
      />
    </div>
  );
}
