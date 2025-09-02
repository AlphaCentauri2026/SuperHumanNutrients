'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play,
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Apple,
  Heart,
  Settings,
  BookOpen,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
  page: 'home' | 'planner' | 'saved' | 'global';
}

const tourSteps: TourStep[] = [
  // Planner Page Tour - Corrected Flow
  {
    id: 'planner-welcome',
    title: 'AI Meal Planner 🍽️',
    description:
      "Welcome to the AI Meal Planner! Let's walk through the main sections step by step.",
    target: '[data-tour="planner-main"]',
    position: 'top',
    icon: <Apple className="w-6 h-6" />,
    page: 'planner',
  },
  {
    id: 'food-selection',
    title: 'Food Selection Areas 🍎🥕🌾',
    description:
      'Here you can add fruits, vegetables, and grains to your meal plan. Each section has suggestions and you can add custom items too.',
    target: '[data-tour="food-selection"]',
    position: 'bottom',
    icon: <Apple className="w-5 h-5" />,
    page: 'planner',
  },
  {
    id: 'nutrition-goals',
    title: 'Nutrition Goals 📝',
    description:
      'Tell our AI what you want to achieve. Be specific: "I want energy for workouts" or "Help me lose weight healthily".',
    target: '[data-tour="user-prompt"]',
    position: 'top',
    icon: <BookOpen className="w-5 h-5" />,
    page: 'planner',
  },
  {
    id: 'additional-preferences',
    title: 'Additional Preferences 🥗',
    description:
      'Add any dietary restrictions or preferences here. Our AI will respect these when creating your meal plans.',
    target: '[data-tour="additional-preferences"]',
    position: 'top',
    icon: <Settings className="w-5 h-5" />,
    page: 'planner',
  },
  {
    id: 'generate-button',
    title: 'Generate Your Plan ⚡',
    description:
      "Once you've selected foods and set your goals, click this button to let our AI create a personalized meal plan.",
    target: '[data-tour="generate-button"]',
    position: 'top',
    icon: <Sparkles className="w-5 h-5" />,
    page: 'planner',
  },

  // Saved Combinations Tour
  {
    id: 'saved-welcome',
    title: 'Your Saved Combinations 💝',
    description:
      "This is your personal collection of meal plans. Let's explore how to manage and organize them.",
    target: '[data-tour="saved-main"]',
    position: 'top',
    icon: <Heart className="w-6 h-6" />,
    page: 'saved',
  },
  {
    id: 'filter-buttons',
    title: 'Filter Your Collection 🔍',
    description:
      'Switch between "All" and "Favorites" to organize your saved combinations. Mark favorites with the star icon.',
    target: '[data-tour="filter-buttons"]',
    position: 'bottom',
    icon: <Settings className="w-5 h-5" />,
    page: 'saved',
  },
  {
    id: 'combination-card',
    title: 'Rich Combination Details 📋',
    description:
      'Each card shows ingredients by category, health benefits, preparation instructions, and creation date.',
    target: '[data-tour="combination-card"]',
    position: 'top',
    icon: <BookOpen className="w-5 h-5" />,
    page: 'saved',
  },
  {
    id: 'favorite-star',
    title: 'Mark as Favorite ⭐',
    description:
      "Click the star in the header to mark combinations as favorites. They'll appear in your favorites filter.",
    target: '[data-tour="favorite-star"]',
    position: 'left',
    icon: <Heart className="w-5 h-5" />,
    page: 'saved',
  },
  {
    id: 'edit-delete',
    title: 'Manage Your Collection 🛠️',
    description:
      'Use Edit to modify combinations or Delete to remove them. Your data is automatically saved to the cloud.',
    target: '[data-tour="edit-delete"]',
    position: 'top',
    icon: <Settings className="w-5 h-5" />,
    page: 'saved',
  },

  // Tour Completion
  {
    id: 'tour-complete',
    title: 'Tour Complete! 🎊',
    description:
      "You're now ready to create amazing meal plans! Remember: you can always restart this tour from the navigation menu.",
    target: '[data-tour="generate-button"]',
    position: 'top',
    icon: <CheckCircle className="w-6 h-6" />,
    page: 'global',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: 'home' | 'planner' | 'saved';
}

export function GuidedTour({ isOpen, onClose, currentPage }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter steps for current page and global steps
  const relevantSteps = tourSteps.filter(
    step => step.page === currentPage || step.page === 'global'
  );

  const currentStep = relevantSteps[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStep) {
      highlightElement(currentStep.target);
    }
  }, [isOpen, currentStep]);

  const highlightElement = (selector: string) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If element doesn't exist (e.g., completion step on wrong page), scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextStep = () => {
    if (currentStepIndex < relevantSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const completeTour = () => {
    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    onClose();
    setCurrentStepIndex(0);
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isOpen || !isVisible || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-10 max-w-sm pointer-events-auto"
        style={{
          top: currentStep.position === 'bottom' ? 'auto' : '50%',
          bottom: currentStep.position === 'bottom' ? '20px' : 'auto',
          left: currentStep.position === 'right' ? 'auto' : '50%',
          right: currentStep.position === 'right' ? '20px' : 'auto',
          transform:
            currentStep.position === 'bottom'
              ? 'translateX(-50%)'
              : currentStep.position === 'right'
                ? 'none'
                : 'translate(-50%, -50%)',
        }}
      >
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">👆</div>
                  {currentStep.icon}
                </div>
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
              </div>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </AnimatedButton>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {currentStep.description}
            </p>

            {currentStep.action && (
              <AnimatedButton
                onClick={currentStep.action.onClick}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {currentStep.action.text}
              </AnimatedButton>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </AnimatedButton>
                <AnimatedButton variant="outline" size="sm" onClick={nextStep}>
                  {currentStepIndex === relevantSteps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </AnimatedButton>
              </div>

              <div className="text-xs text-muted-foreground">
                {currentStepIndex + 1} of {relevantSteps.length}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex gap-1">
                {relevantSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStepIndex
                        ? 'bg-primary'
                        : index < currentStepIndex
                          ? 'bg-primary/50'
                          : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tour trigger component
export function TourTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'planner' | 'saved'>(
    'home'
  );
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/planner') {
      setCurrentPage('planner');
      setShowTour(true);
    } else if (path === '/saved') {
      setCurrentPage('saved');
      setShowTour(true);
    } else {
      setCurrentPage('home');
      setShowTour(false);
    }
  }, []);

  // Don't show tour button on home page
  if (!showTour) {
    return null;
  }

  return (
    <>
      <AnimatedButton
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        Take Tour
      </AnimatedButton>

      <GuidedTour
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentPage={currentPage}
      />
    </>
  );
}
