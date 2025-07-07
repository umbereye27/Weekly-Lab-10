"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/utils/api";

interface CreateSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillCreated: (skill: any) => void;
}

export function CreateSkillDialog({
  open,
  onOpenChange,
  onSkillCreated,
}: CreateSkillDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth("/api/skills", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const newSkill = await response.json();
        onSkillCreated(newSkill);
        setTitle("");
        setDescription("");
      } else {
        setError("Failed to create skill");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Skill</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new skill to track your learning progress
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="title" className="text-slate-300">
              Title
            </FormLabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React.js Development"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="description" className="text-slate-300">
              Description
            </FormLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to learn..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
              rows={3}
            />
          </FormField>

          {error && <FormMessage className="text-red-400">{error}</FormMessage>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Creating..." : "Create Skill"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
