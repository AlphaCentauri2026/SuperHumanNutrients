'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { SavedCombinations } from '@/components/SavedCombinations';

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <SavedCombinations />
        </div>
      </main>
    </div>
  );
}
