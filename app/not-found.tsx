"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-slate-400 mb-6">Page Not Found</p>
        <p className="text-slate-500 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <div className="space-y-4">
          <Button 
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
          >
            <Link href="/">Return Home</Link>
          </Button>
          
          <div className="pt-4 text-center">
            <Link href="/debug/auth" className="text-indigo-400 hover:text-indigo-300">
              Go to Debug Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
