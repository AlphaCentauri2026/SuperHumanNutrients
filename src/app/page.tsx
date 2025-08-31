'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Apple,
  Carrot,
  Wheat,
  Brain,
  Users,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-800">
      <Navigation />

      {/* Hero Section */}
      <main className="relative">
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Superhuman
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Nutrition
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate optimal meal plans combining fruits, vegetables, and
              grains using advanced AI. Transform your nutrition journey with
              personalized, science-backed meal planning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/planner">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 border-border hover:bg-accent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Apple className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Smart Food Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Choose from a curated selection of fruits, vegetables, and
                  grains. Our AI understands nutritional synergy and creates
                  balanced combinations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  AI-Powered Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Advanced AI algorithms generate personalized meal plans based
                  on your preferences, dietary restrictions, and nutritional
                  goals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Instant Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Get instant access to detailed meal plans with cooking
                  instructions, nutritional information, and shopping lists.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Carrot className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Dietary Flexibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Accommodate vegetarian, vegan, gluten-free, and other dietary
                  preferences while maintaining nutritional balance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Wheat className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Whole Food Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Emphasize whole, unprocessed foods that provide maximum
                  nutritional value and support long-term health.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Community Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Join a community of health-conscious individuals sharing
                  recipes, tips, and success stories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
              Start your journey to optimal health with AI-powered meal planning
              today.
            </p>
            <Link href="/planner">
              <Button className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-200 px-8 py-4 text-lg font-semibold">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Planning Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
