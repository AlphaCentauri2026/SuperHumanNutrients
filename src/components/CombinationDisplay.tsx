'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Star,
  Heart,
  Zap,
  Target,
  Apple,
  Carrot,
  Wheat,
  Leaf,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface Combination {
  name?: string;
  fruits?: string;
  vegetables?: string;
  grain?: string;
  benefits?: string;
  preparation?: string;
}

interface CombinationDisplayProps {
  combinations: Combination[] | string;
  individualCombinations?: Combination[];
  parsedCombinations?: Combination[];
  onRegenerate?: () => void;
}

export function CombinationDisplay({
  combinations,
  individualCombinations = [],
  parsedCombinations = [],
  onRegenerate,
}: CombinationDisplayProps) {
  const { user } = useAuth();
  const { saveCombination, loading, error, clearError } = useDatabase();
  const [savedStatus, setSavedStatus] = useState<{
    [key: number]: 'saved' | 'error' | null;
  }>({});

  function getRandomGradient(index: number) {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
    ];
    return gradients[index % gradients.length];
  }

  function handleRecycleAll() {
    console.log('🔄 Regenerate button clicked');
    console.log('onRegenerate function:', onRegenerate);
    if (typeof onRegenerate === 'function') {
      console.log('✅ Calling onRegenerate function');
      onRegenerate();
    } else {
      console.log('❌ onRegenerate is not a function');
    }
  }

  function isValidCombination(combination: Combination): boolean {
    return !!(
      combination.fruits ||
      combination.vegetables ||
      combination.grain
    );
  }

  const handleSaveCombination = async (
    combination: Combination,
    index: number
  ) => {
    if (!user) {
      setSavedStatus({ ...savedStatus, [index]: 'error' });
      return;
    }

    try {
      // Parse the combination data for database storage
      const combinationData = {
        userId: user.uid,
        name: combination.name || `Combination ${index + 1}`,
        fruits: combination.fruits ? [combination.fruits] : [],
        vegetables: combination.vegetables ? [combination.vegetables] : [],
        grains: combination.grain ? [combination.grain] : [],
        benefits: combination.benefits ? [combination.benefits] : [],
        preparation: combination.preparation || '',
        tags: [],
        isFavorite: true,
        nutritionFacts: {
          calories: 0, // You can calculate this based on food groups
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
      };

      await saveCombination(combinationData);
      setSavedStatus({ ...savedStatus, [index]: 'saved' });

      // Clear success status after 3 seconds
      setTimeout(() => {
        setSavedStatus(prev => ({ ...prev, [index]: null }));
      }, 3000);
    } catch (err) {
      console.error('Failed to save combination:', err);
      setSavedStatus({ ...savedStatus, [index]: 'error' });
    }
  };

  // Compute display combinations directly from props
  let displayCombinations: Combination[] = [];

  console.log('CombinationDisplay received:', {
    combinations: Array.isArray(combinations)
      ? combinations.length
      : typeof combinations,
    parsedCombinations: parsedCombinations.length,
    individualCombinations: individualCombinations.length,
  });

  if (Array.isArray(combinations)) {
    displayCombinations = combinations;
  } else if (parsedCombinations.length > 0) {
    displayCombinations = parsedCombinations;
  } else if (individualCombinations.length > 0) {
    displayCombinations = individualCombinations;
  }

  console.log('Display combinations:', displayCombinations.length);

  if (!displayCombinations || displayCombinations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            No Combinations Found
          </h3>
          <p className="text-yellow-700 mb-4">
            The AI response couldn&apos;t be parsed into combinations. This
            might happen if the AI format changed.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-600 mb-2">Raw AI Response:</p>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
              {typeof combinations === 'string'
                ? combinations.substring(0, 500) + '...'
                : 'No raw response available'}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const validCombinations = displayCombinations.filter(isValidCombination);

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
          <Target className="w-6 h-6" />
          <span className="text-lg font-semibold">
            Your 7-Day Nutrition Plan
          </span>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          One unique fruit-vegetable-grain combination for each day of the week
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 inline-block">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Successfully parsed {validCombinations.length} of{' '}
            {displayCombinations.length} combinations
          </p>
        </div>
      </div>

      {/* Combinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {validCombinations.map((combination, index) => (
          <Card
            key={index}
            data-card-index={index}
            className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardHeader
              className={`bg-gradient-to-r ${getRandomGradient(index)} text-white rounded-t-lg`}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {combination.name || `Combination ${index + 1}`}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Ingredients Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground text-sm">
                  Ingredients:
                </h4>

                {combination.fruits && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <Apple className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <div>
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        Fruits:
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {combination.fruits}
                      </p>
                    </div>
                  </div>
                )}

                {combination.vegetables && (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <Carrot className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Vegetables:
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {combination.vegetables}
                      </p>
                    </div>
                  </div>
                )}

                {combination.grain && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Grain:
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {combination.grain}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Health Benefits Section */}
              {combination.benefits && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <h5 className="font-medium text-foreground text-sm">
                      Health Benefits:
                    </h5>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {combination.benefits}
                  </p>

                  {/* Nutrient Tags */}
                  {(combination.benefits.toLowerCase().includes('vitamin') ||
                    combination.benefits.toLowerCase().includes('iron') ||
                    combination.benefits
                      .toLowerCase()
                      .includes('antioxidant') ||
                    combination.benefits.toLowerCase().includes('potassium') ||
                    combination.benefits.toLowerCase().includes('fiber') ||
                    combination.benefits.toLowerCase().includes('calcium') ||
                    combination.benefits
                      .toLowerCase()
                      .includes('magnesium')) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {combination.benefits
                        .match(
                          /(vitamin\s+[a-z]|iron|antioxidant|fiber|protein|omega-3|potassium|calcium|magnesium|zinc)/gi
                        )
                        ?.map((nutrient: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full"
                          >
                            <Leaf className="w-3 h-3" />
                            {nutrient}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preparation Section */}
              {combination.preparation && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <h5 className="font-medium text-foreground text-sm">
                      Preparation:
                    </h5>
                  </div>
                  <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                    {combination.preparation}
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleSaveCombination(combination, index)}
                  disabled={loading || savedStatus[index] === 'saved'}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    savedStatus[index] === 'saved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                      : savedStatus[index] === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {savedStatus[index] === 'saved' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved!
                    </>
                  ) : savedStatus[index] === 'error' ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Error - Try Again
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save to Favorites'}
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleRecycleAll}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Target className="w-5 h-5" />
          Generate New Combinations
        </button>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Zap className="w-5 h-5" />
          Refresh Page
        </button>

        <button
          onClick={() => {
            // Copy combinations to clipboard
            const combinationsText = validCombinations
              .map(
                (combo, index) =>
                  `${index + 1}. ${combo.name || `Combination ${index + 1}`}\n` +
                  `   Fruits: ${combo.fruits || 'None'}\n` +
                  `   Vegetables: ${combo.vegetables || 'None'}\n` +
                  `   Grain: ${combo.grain || 'None'}\n` +
                  `   Benefits: ${combo.benefits || 'None'}\n` +
                  `   Preparation: ${combo.preparation || 'None'}`
              )
              .join('\n\n');

            navigator.clipboard
              .writeText(combinationsText)
              .then(() => {
                alert('Combinations copied to clipboard!');
              })
              .catch(() => {
                alert('Failed to copy to clipboard');
              });
          }}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <FileText className="w-5 h-5" />
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
