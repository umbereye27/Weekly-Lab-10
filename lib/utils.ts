import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function calculateProgress(tasks: { completed: boolean }[]): number {
//   if (tasks.length === 0) return 0
//   const completedTasks = tasks.filter(task => task.completed).length
//   return Math.round((completedTasks / tasks.length) * 100)
// }
