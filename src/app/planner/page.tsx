'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MealPlanner } from '@/components/MealPlanner';
import { Navigation } from '@/components/Navigation';
import { Loader2 } from 'lucide-react';

export default function PlannerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the AI meal planner and create personalized
            nutrition plans.
          </p>
          <a
            href="/login"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <MealPlanner />
      </main>
    </div>
  );
}
