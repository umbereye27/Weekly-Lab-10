"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export function VaultHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/vault" className="text-2xl font-bold text-indigo-600">
          SkillVault
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
