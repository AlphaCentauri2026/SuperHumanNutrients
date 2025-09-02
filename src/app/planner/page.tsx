'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MealPlanner } from '@/components/MealPlanner';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedCard } from '@/components/ui/animated-card';
import { GradientButton } from '@/components/ui/animated-button';
import { Navigation } from '@/components/Navigation';
import { Sparkles, Target, Brain, Zap, Loader2, Lock } from 'lucide-react';
import { fadeInUp, staggerContainer, floating } from '@/lib/animations';

export default function PlannerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-800 particles">
        <motion.div
          className="flex items-center justify-center min-h-screen"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              variants={floating}
              animate="animate"
            >
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-foreground mb-2"
              variants={fadeInUp}
            >
              Loading Your Experience
            </motion.h2>
            <motion.p className="text-muted-foreground" variants={fadeInUp}>
              Preparing your personalized nutrition journey...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-800 particles">
        <Navigation />
        <motion.div
          className="flex items-center justify-center min-h-screen px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="text-center max-w-md mx-auto">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              variants={floating}
              animate="animate"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-foreground mb-4"
              variants={fadeInUp}
            >
              Unlock Your Nutrition Journey
            </motion.h2>

            <motion.p
              className="text-muted-foreground mb-8 text-lg"
              variants={fadeInUp}
            >
              Sign in to access our AI-powered meal planner and create
              personalized nutrition plans that transform your health.
            </motion.p>

            <motion.div className="space-y-4" variants={fadeInUp}>
              <GradientButton
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
                iconPosition="left"
                className="w-full"
                onClick={() => (window.location.href = '/login')}
              >
                Start Your Journey
              </GradientButton>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <AnimatedCard className="text-center p-4">
                  <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">AI-Powered</h3>
                  <p className="text-xs text-muted-foreground">
                    Advanced algorithms
                  </p>
                </AnimatedCard>

                <AnimatedCard className="text-center p-4">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Personalized</h3>
                  <p className="text-xs text-muted-foreground">
                    Tailored to you
                  </p>
                </AnimatedCard>

                <AnimatedCard className="text-center p-4">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Instant</h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time results
                  </p>
                </AnimatedCard>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-800 particles">
      <Navigation />

      <motion.main
        className="py-8 px-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Hero Section */}
        <motion.div className="max-w-7xl mx-auto mb-8" variants={fadeInUp}>
          <div className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4 glass"
              variants={fadeInUp}
            >
              <Sparkles className="w-4 h-4" />
              Welcome back, {user.displayName || 'Nutrition Explorer'}!
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
              variants={fadeInUp}
            >
              AI Meal Planner
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Create personalized nutrition plans with our advanced AI. Select
              your favorite foods or describe your goals, and watch the magic
              happen!
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div className="max-w-7xl mx-auto" variants={fadeInUp}>
          <MealPlanner />
        </motion.div>
      </motion.main>
    </div>
  );
}
