"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  onSearch,
  onAddSkill,
}: {
  onSearch?: (query: string) => void;
  onAddSkill?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Track your learning progress</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 w-80 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-indigo-500"
          />
        </div>
        <Button
          onClick={onAddSkill}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
    </div>
  );
}
