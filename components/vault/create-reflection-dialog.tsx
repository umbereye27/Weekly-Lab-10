"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface CreateReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  onReflectionCreated: (reflection: any) => void;
}

export function CreateReflectionDialog({
  open,
  onOpenChange,
  skillId,
  onReflectionCreated,
}: CreateReflectionDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth("/api/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, skillId }),
      });

      onReflectionCreated(response);
      setContent("");
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Reflection</DialogTitle>
          <DialogDescription>
            Document your thoughts, insights, and progress on this skill
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="content">Your Reflection</FormLabel>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What have you learned? What challenges did you face? What insights did you gain?"
              rows={8}
              required
            />
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Reflection"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
