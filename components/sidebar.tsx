"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Settings,
  User,
  LogOut,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  BarChart as ChartLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";

export const DashboardSidebar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <aside className="">
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-700">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">SkillVault</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link href="/vault">
            <Button
              variant="ghost"
              className="w-full justify-start text-white bg-indigo-600/20 border border-indigo-500/30"
            >
              <Target className="h-4 w-4 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-3" />
            Add Skill
          </Button>
          <Link href="/vault/profile">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </Button>
          </Link>
          <Link href="/vault/settings">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
          </Link>
          <Link href="/vault/skills">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <BookOpen className="h-4 w-4 mr-3" />
              Skills
            </Button>
          </Link>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-700 text-white text-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};
