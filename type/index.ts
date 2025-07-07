export interface Reflection {
  id: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}
export interface Skill {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  userId: string;
  tasks: Task[];
  reflections: Reflection[];
  _count?: {
    tasks: number;
    reflections: number;
  };
  progress?: number;
  status?: string;
}

export interface ActivityItem {
  id: string;
  type: "completed" | "added" | "reflection";
  title: string;
  skill: string;
  time: string;
}
