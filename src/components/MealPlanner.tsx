'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, ElevatedCard } from '@/components/ui/animated-card';
import {
  AnimatedButton,
  GradientButton,
} from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  Sparkles,
  Target,
  Apple,
  Carrot,
  Wheat,
  Star,
  CheckCircle,
  RefreshCw,
  Save,
  Share2,
} from 'lucide-react';
import { CombinationDisplay } from './CombinationDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/hooks/useDatabase';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface Combination {
  name?: string;
  fruits?: string;
  vegetables?: string;
  grain?: string;
  benefits?: string;
  preparation?: string;
}

interface FoodGroup {
  id: string;
  name: string;
  category:
    | 'fruits'
    | 'vegetables'
    | 'grains'
    | 'proteins'
    | 'dairy'
    | 'nuts'
    | 'herbs'
    | 'spices';
  subcategory?: string;
  nutrients: string[];
  benefits: string[];
  seasonality?: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  glycemicIndex?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  isActive: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export function MealPlanner() {
  const { user } = useAuth();
  const { getFoodGroups } = useDatabase();

  const [fruits, setFruits] = useState<string[]>([]);
  const [vegetables, setVegetables] = useState<string[]>([]);
  const [grains, setGrains] = useState<string[]>([]);
  const [newFruit, setNewFruit] = useState('');
  const [newVegetable, setNewVegetable] = useState('');
  const [newGrain, setNewGrain] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [preferences, setPreferences] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [parsedCombinations, setParsedCombinations] = useState<Combination[]>(
    []
  );
  const [error, setError] = useState<string>('');

  const loadFoodGroups = useCallback(async () => {
    try {
      await getFoodGroups();
    } catch (error) {
      console.error('Error loading food groups:', error);
    }
  }, [getFoodGroups]);

  useEffect(() => {
    loadFoodGroups();
  }, [loadFoodGroups]);

  const addFoodItem = (
    type: 'fruits' | 'vegetables' | 'grains',
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (
      value.trim() &&
      !fruits.includes(value.trim()) &&
      !vegetables.includes(value.trim()) &&
      !grains.includes(value.trim())
    ) {
      setter(prev => [...prev, value.trim()]);
      if (type === 'fruits') setNewFruit('');
      if (type === 'vegetables') setNewVegetable('');
      if (type === 'grains') setNewGrain('');
    }
  };

  const removeFoodItem = (
    type: 'fruits' | 'vegetables' | 'grains',
    item: string
  ) => {
    if (type === 'fruits') setFruits(prev => prev.filter(f => f !== item));
    if (type === 'vegetables')
      setVegetables(prev => prev.filter(v => v !== item));
    if (type === 'grains') setGrains(prev => prev.filter(g => g !== item));
  };

  const clearAllFoods = () => {
    setFruits([]);
    setVegetables([]);
    setGrains([]);
    setNewFruit('');
    setNewVegetable('');
    setNewGrain('');
  };

  const clearAllPreferences = () => {
    setUserPrompt('');
    setPreferences('');
    setDietaryRestrictions([]);
  };

  const resetAll = () => {
    clearAllFoods();
    clearAllPreferences();
    setParsedCombinations([]);
    setError('');
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleGenerateMealPlan = async () => {
    console.log('🚀 handleGenerateMealPlan called');
    console.log('User:', user);
    console.log('Foods:', { fruits, vegetables, grains });
    console.log('User prompt:', userPrompt);

    if (!user) {
      setError('Please sign in to generate meal plans');
      return;
    }

    if (
      fruits.length === 0 &&
      vegetables.length === 0 &&
      grains.length === 0 &&
      !userPrompt.trim()
    ) {
      setError(
        'Please either select food items or describe your nutrition goal'
      );
      return;
    }

    setLoading(true);
    setError('');
    setParsedCombinations([]);

    try {
      const request = {
        fruits,
        vegetables,
        grains,
        userPrompt: userPrompt || undefined,
        preferences: preferences || undefined,
        dietaryRestrictions:
          dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      };

      // Call the API route instead of the direct AI function
      console.log('📡 Calling API endpoint: /api/meal-plan');
      console.log('Request payload:', request);

      const response = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('📡 API Response data:', data);

      if (data.success) {
        console.log('Raw AI Response:', data.mealPlan); // Debug log
        // Parse the AI response into structured combinations
        const parsed = parseAIResponse(data.mealPlan);
        setParsedCombinations(parsed);
        console.log('Parsed combinations count:', parsed.length); // Debug log

        // If parsing failed, try to use a fallback response
        if (parsed.length === 0) {
          console.log('Parsing failed, using fallback response');
          const fallbackCombinations = getFallbackCombinations();
          setParsedCombinations(fallbackCombinations);
        }
      } else {
        setError(data.error || 'Failed to generate meal plan');
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to generate meal plan: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const FoodSelector = ({
    title,
    items,
    newItem,
    setNewItem,
    onAdd,
    onRemove,
    suggestions,
    onClear,
    icon,
    color,
    ...props
  }: {
    title: string;
    items: string[];
    newItem: string;
    setNewItem: React.Dispatch<React.SetStateAction<string>>;
    onAdd: () => void;
    onRemove: (item: string) => void;
    suggestions: string[];
    onClear: () => void;
    icon: React.ReactNode;
    color: string;
    [key: string]: unknown;
  }) => (
    <div className="space-y-4" {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div>
          <Label className="text-sm font-medium text-foreground">{title}</Label>
        </div>
        {items.length > 0 && (
          <AnimatedButton
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
          >
            Clear All
          </AnimatedButton>
        )}
      </div>

      {/* Selected Items */}
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div
            key={`${title}-${item}`}
            className="animate-in fade-in-0 scale-in-95 duration-150"
          >
            <Badge
              variant="secondary"
              className={`${color} text-white border-0 flex items-center gap-1`}
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                className="ml-1 hover:opacity-80 transition-opacity"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1"
          onKeyPress={e => {
            if (e.key === 'Enter') {
              onAdd();
            }
          }}
        />
        <AnimatedButton
          onClick={onAdd}
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          disabled={!newItem.trim()}
        >
          Add
        </AnimatedButton>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 5).map(suggestion => (
            <motion.button
              key={`${title}-suggestion-${suggestion}`}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                // Directly add the suggestion without intermediate state changes or delays
                if (title === 'Fruits') {
                  setFruits(prev =>
                    prev.includes(suggestion) ? prev : [...prev, suggestion]
                  );
                } else if (title === 'Vegetables') {
                  setVegetables(prev =>
                    prev.includes(suggestion) ? prev : [...prev, suggestion]
                  );
                } else if (title === 'Grains') {
                  setGrains(prev =>
                    prev.includes(suggestion) ? prev : [...prev, suggestion]
                  );
                }
              }}
              className={`text-xs px-2 py-1 rounded-full border ${color.replace('bg-', 'border-')} hover:${color} hover:text-white transition-colors cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
              type="button"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );

  const getFallbackCombinations = (): Combination[] => {
    return [
      {
        name: 'Iron-Rich Power Bowl',
        fruits: '1 cup strawberries, 1 medium orange',
        vegetables: '2 cups spinach, 1 cup broccoli',
        grain: '1/2 cup quinoa',
        benefits: 'Rich in iron, vitamin C, and fiber for energy and immunity',
        preparation: 'Steam quinoa, sauté vegetables, add fresh fruits',
      },
      {
        name: 'Potassium Boost Medley',
        fruits: '1 medium banana, 1 cup blueberries',
        vegetables: '1 cup sweet potato, 1 cup kale',
        grain: '1/2 cup brown rice',
        benefits:
          'High in potassium, antioxidants, and complex carbs for sustained energy',
        preparation:
          'Cook rice, roast sweet potato, steam kale, add fresh fruits',
      },
      {
        name: 'Vitamin C Immunity Shield',
        fruits: '1 cup pineapple, 1 medium kiwi',
        vegetables: '1 cup bell peppers, 1 cup Brussels sprouts',
        grain: '1/2 cup farro',
        benefits: 'Packed with vitamin C, fiber, and immune-boosting nutrients',
        preparation: 'Cook farro, roast vegetables, add fresh fruits',
      },
      {
        name: 'Fiber-Rich Energy Explosion',
        fruits: '1 cup raspberries, 1 medium apple',
        vegetables: '1 cup carrots, 1 cup cauliflower',
        grain: '1/2 cup barley',
        benefits:
          'High fiber content for digestive health and sustained energy',
        preparation: 'Cook barley, steam vegetables, add fresh fruits',
      },
      {
        name: 'Antioxidant Power Pack',
        fruits: '1 cup blackberries, 1 medium pomegranate',
        vegetables: '1 cup beets, 1 cup arugula',
        grain: '1/2 cup wild rice',
        benefits:
          'Rich in antioxidants, nitrates, and anti-inflammatory compounds',
        preparation:
          'Cook wild rice, roast beets, add fresh arugula and fruits',
      },
      {
        name: 'Calcium-Rich Bone Builder',
        fruits: '1 cup figs, 1 medium pear',
        vegetables: '1 cup collard greens, 1 cup bok choy',
        grain: '1/2 cup amaranth',
        benefits: 'High in calcium, vitamin K, and minerals for bone health',
        preparation: 'Cook amaranth, steam greens, add fresh fruits',
      },
      {
        name: 'Omega-3 Brain Fuel',
        fruits: '1 cup avocado, 1 medium grapefruit',
        vegetables: '1 cup Brussels sprouts, 1 cup asparagus',
        grain: '1/2 cup teff',
        benefits:
          'Rich in healthy fats, B vitamins, and minerals for brain function',
        preparation:
          'Cook teff, roast vegetables, add fresh avocado and grapefruit',
      },
    ];
  };

  const parseAIResponse = (response: string): Combination[] => {
    const combinations: Combination[] = [];

    try {
      // Try to find structured combinations first
      const combinationRegex =
        /COMBINATION\s+\d+\s*\([^)]+\):([\s\S]*?)(?=COMBINATION\s+\d+\s*\([^)]+\):|$)/gi;
      const matches = response.match(combinationRegex);

      if (matches && matches.length > 0) {
        // Parse structured format
        matches.forEach(match => {
          const combination: Combination = {};
          const lines = match
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);

          lines.forEach(line => {
            if (line.toLowerCase().includes('name:')) {
              combination.name = line.replace(/.*name:\s*/i, '').trim();
            } else if (line.toLowerCase().includes('fruit')) {
              combination.fruits = line.replace(/.*?:/i, '').trim();
            } else if (line.toLowerCase().includes('vegetable')) {
              combination.vegetables = line.replace(/.*?:/i, '').trim();
            } else if (line.toLowerCase().includes('grain')) {
              combination.grain = line.replace(/.*?:/i, '').trim();
            } else if (line.toLowerCase().includes('benefit')) {
              combination.benefits = line.replace(/.*?:/i, '').trim();
            } else if (
              line.toLowerCase().includes('preparation') ||
              line.toLowerCase().includes('recipe')
            ) {
              combination.preparation = line.replace(/.*?:/i, '').trim();
            }
          });

          if (
            combination.fruits ||
            combination.vegetables ||
            combination.grain
          ) {
            combinations.push(combination);
          }
        });
      } else {
        // Fallback: try to parse any structured format
        const sections = response.split(/\n\n|\r\n\r\n/);

        sections.forEach(section => {
          if (section.trim()) {
            const lines = section
              .split('\n')
              .map(line => line.trim())
              .filter(line => line);

            if (lines.length > 0) {
              const combination: Combination = {};

              lines.forEach(line => {
                if (line.toLowerCase().includes('name:')) {
                  combination.name = line.replace(/.*name:\s*/i, '').trim();
                } else if (line.toLowerCase().includes('fruit')) {
                  combination.fruits = line.replace(/.*?:/i, '').trim();
                } else if (line.toLowerCase().includes('vegetable')) {
                  combination.vegetables = line.replace(/.*?:/i, '').trim();
                } else if (line.toLowerCase().includes('grain')) {
                  combination.grain = line.replace(/.*?:/i, '').trim();
                } else if (line.toLowerCase().includes('benefit')) {
                  combination.benefits = line.replace(/.*?:/i, '').trim();
                } else if (
                  line.toLowerCase().includes('preparation') ||
                  line.toLowerCase().includes('recipe')
                ) {
                  combination.preparation = line.replace(/.*?:/i, '').trim();
                }
              });

              if (
                combination.fruits ||
                combination.vegetables ||
                combination.grain
              ) {
                combinations.push(combination);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    return combinations;
  };

  const dietaryRestrictionOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Mediterranean',
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      data-tour="planner-main"
    >
      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={fadeInUp}
      >
        <AnimatedCard className="text-center p-4">
          <Apple className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {fruits.length}
          </div>
          <div className="text-sm text-muted-foreground">Fruits</div>
        </AnimatedCard>

        <AnimatedCard className="text-center p-4">
          <Carrot className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {vegetables.length}
          </div>
          <div className="text-sm text-muted-foreground">Vegetables</div>
        </AnimatedCard>

        <AnimatedCard className="text-center p-4">
          <Wheat className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {grains.length}
          </div>
          <div className="text-sm text-muted-foreground">Grains</div>
        </AnimatedCard>

        <AnimatedCard className="text-center p-4">
          <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {parsedCombinations.length}
          </div>
          <div className="text-sm text-muted-foreground">Combinations</div>
        </AnimatedCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Food Selection */}
        <motion.div className="space-y-6" variants={fadeInUp}>
          <ElevatedCard data-tour="food-selection">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Food Selection
                </h2>
                <AnimatedButton
                  onClick={resetAll}
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Reset All
                </AnimatedButton>
              </div>

              <div className="space-y-6">
                <FoodSelector
                  title="Fruits"
                  items={fruits}
                  newItem={newFruit}
                  setNewItem={setNewFruit}
                  onAdd={() => addFoodItem('fruits', newFruit, setFruits)}
                  onRemove={item => removeFoodItem('fruits', item)}
                  onClear={() => setFruits([])}
                  suggestions={[
                    'Apple',
                    'Banana',
                    'Orange',
                    'Strawberry',
                    'Blueberry',
                  ]}
                  icon={<Apple className="w-4 h-4 text-white" />}
                  color="bg-red-500"
                />

                <FoodSelector
                  title="Vegetables"
                  items={vegetables}
                  newItem={newVegetable}
                  setNewItem={setNewVegetable}
                  onAdd={() =>
                    addFoodItem('vegetables', newVegetable, setVegetables)
                  }
                  onRemove={item => removeFoodItem('vegetables', item)}
                  onClear={() => setVegetables([])}
                  suggestions={[
                    'Spinach',
                    'Kale',
                    'Broccoli',
                    'Carrot',
                    'Tomato',
                  ]}
                  icon={<Carrot className="w-4 h-4 text-white" />}
                  color="bg-green-500"
                />

                <FoodSelector
                  title="Grains"
                  items={grains}
                  newItem={newGrain}
                  setNewItem={setNewGrain}
                  onAdd={() => addFoodItem('grains', newGrain, setGrains)}
                  onRemove={item => removeFoodItem('grains', item)}
                  onClear={() => setGrains([])}
                  suggestions={[
                    'Quinoa',
                    'Brown Rice',
                    'Oats',
                    'Barley',
                    'Millet',
                  ]}
                  icon={<Wheat className="w-4 h-4 text-white" />}
                  color="bg-yellow-500"
                />
              </div>
            </div>
          </ElevatedCard>

          {/* Preferences Section */}
          <ElevatedCard data-tour="nutrition-goals">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Your Goals & Preferences
              </h2>

              <div className="space-y-4">
                <div data-tour="user-prompt">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Describe your nutrition goal
                  </Label>
                  <Textarea
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="e.g., I want to build muscle, lose weight, improve energy, or create a balanced meal plan..."
                    className="min-h-[80px]"
                  />
                </div>

                <div data-tour="additional-preferences">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Additional preferences
                  </Label>
                  <Textarea
                    value={preferences}
                    onChange={e => setPreferences(e.target.value)}
                    placeholder="e.g., I prefer quick recipes, love spicy food, want high protein meals..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Dietary Restrictions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryRestrictionOptions.map(restriction => (
                      <motion.button
                        key={restriction}
                        onClick={() => toggleDietaryRestriction(restriction)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          dietaryRestrictions.includes(restriction)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {restriction}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ElevatedCard>
        </motion.div>

        {/* Right Column - Results */}
        <motion.div className="space-y-6" variants={fadeInUp}>
          {/* Generate Button */}
          <ElevatedCard data-tour="generate-button">
            <div className="p-6">
              <div className="text-center">
                <GradientButton
                  onClick={handleGenerateMealPlan}
                  loading={loading}
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                  iconPosition="left"
                  className="w-full"
                  disabled={
                    fruits.length === 0 &&
                    vegetables.length === 0 &&
                    grains.length === 0 &&
                    !userPrompt.trim()
                  }
                >
                  {loading
                    ? 'Generating Your Meal Plan...'
                    : 'Generate AI Meal Plan'}
                </GradientButton>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </ElevatedCard>

          {/* Results */}
          <AnimatePresence>
            {parsedCombinations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Your AI-Generated Combinations
                  </h2>
                  <div className="flex gap-2">
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      icon={<Share2 className="w-4 h-4" />}
                    >
                      Share
                    </AnimatedButton>
                  </div>
                </div>

                <CombinationDisplay combinations={parsedCombinations} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
