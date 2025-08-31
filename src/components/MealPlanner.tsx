'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Plus,
  X,
  Sparkles,
  Target,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CombinationDisplay } from './CombinationDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/hooks/useDatabase';

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
  category: string;
  description: string;
  nutritionFacts?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  benefits?: string[]; // Added benefits to FoodGroup interface
}

export function MealPlanner() {
  const { user } = useAuth();
  const { getFoodGroups, loading: dbLoading, error: dbError } = useDatabase();

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
  const [mealPlan, setMealPlan] = useState<string>('');
  const [parsedCombinations, setParsedCombinations] = useState<Combination[]>(
    []
  );
  const [error, setError] = useState<string>('');

  // Database food groups
  const [allFoodGroups, setAllFoodGroups] = useState<FoodGroup[]>([]);
  const [categorizedFoods, setCategorizedFoods] = useState({
    fruits: [] as FoodGroup[],
    vegetables: [] as FoodGroup[],
    grains: [] as FoodGroup[],
  });
  const [showDatabase, setShowDatabase] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    fruits: false,
    vegetables: false,
    grains: false,
  });

  // Load food groups from database on component mount
  useEffect(() => {
    loadFoodGroups();
  }, []);

  const loadFoodGroups = async () => {
    try {
      const foodGroups = await getFoodGroups();
      setAllFoodGroups(foodGroups);

      // Categorize foods by type
      const categorized = {
        fruits: foodGroups.filter((f: FoodGroup) =>
          f.category?.toLowerCase().includes('fruit')
        ),
        vegetables: foodGroups.filter((f: FoodGroup) =>
          f.category?.toLowerCase().includes('vegetable')
        ),
        grains: foodGroups.filter(
          (f: FoodGroup) =>
            f.category?.toLowerCase().includes('grain') ||
            f.category?.toLowerCase().includes('cereal') ||
            f.category?.toLowerCase().includes('carbohydrate')
        ),
      };

      setCategorizedFoods(categorized);
    } catch (error) {
      console.error('Failed to load food groups:', error);
    }
  };

  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Function to parse AI response into structured combinations
  const parseAIResponse = (aiResponse: string): Combination[] => {
    try {
      console.log('Parsing AI response:', aiResponse.substring(0, 200) + '...'); // Debug log

      const combinations: Combination[] = [];
      const lines = aiResponse.split('\n');
      let currentCombination: Partial<Combination> = {};

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Check if we're starting a new combination
        if (trimmedLine.match(/^COMBINATION \d+ \(/)) {
          // Save previous combination if it exists
          if (Object.keys(currentCombination).length > 0) {
            combinations.push(currentCombination as Combination);
          }

          // Start new combination
          currentCombination = {};
        } else if (trimmedLine.startsWith('Name:')) {
          currentCombination.name = trimmedLine
            .replace('Name:', '')
            .trim()
            .replace(/"/g, '');
        } else if (trimmedLine.startsWith('Fruits:')) {
          currentCombination.fruits = trimmedLine.replace('Fruits:', '').trim();
        } else if (trimmedLine.startsWith('Vegetables:')) {
          currentCombination.vegetables = trimmedLine
            .replace('Vegetables:', '')
            .trim();
        } else if (trimmedLine.startsWith('Grain:')) {
          currentCombination.grain = trimmedLine.replace('Grain:', '').trim();
        } else if (trimmedLine.startsWith('Benefits:')) {
          currentCombination.benefits = trimmedLine
            .replace('Benefits:', '')
            .trim();
        } else if (trimmedLine.startsWith('Preparation:')) {
          currentCombination.preparation = trimmedLine
            .replace('Preparation:', '')
            .trim();
        }
      }

      // Add the last combination
      if (Object.keys(currentCombination).length > 0) {
        combinations.push(currentCombination as Combination);
      }

      return combinations.filter(
        combo => combo.fruits || combo.vegetables || combo.grain
      );
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  };

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
    setMealPlan('');
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
    setMealPlan('');
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
        setMealPlan(data.mealPlan);
        console.log('Raw AI Response:', data.mealPlan); // Debug log
        // Parse the AI response into structured combinations
        const parsed = parseAIResponse(data.mealPlan);
        setParsedCombinations(parsed);
        console.log('Parsed combinations count:', parsed.length); // Debug log
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
  }: {
    title: string;
    items: string[];
    newItem: string;
    setNewItem: React.Dispatch<React.SetStateAction<string>>;
    onAdd: () => void;
    onRemove: (item: string) => void;
    suggestions: string[];
    onClear: () => void;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">{title}</Label>
        {items.length > 0 && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Selected Items */}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="ml-1 hover:text-blue-600"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder={`Add ${title.toLowerCase()}`}
          className="flex-1"
          onKeyPress={e => e.key === 'Enter' && onAdd()}
        />
        <Button onClick={onAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter(item => !items.includes(item))
          .slice(0, 5)
          .map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => {
                addFoodItem(
                  title.toLowerCase() as 'fruits' | 'vegetables' | 'grains',
                  item,
                  title === 'Fruits'
                    ? setFruits
                    : title === 'Vegetables'
                      ? setVegetables
                      : setGrains
                );
              }}
            >
              {item}
            </Badge>
          ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">VitalBlend</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover unique fruit-vegetable-grain combinations for optimal health
        </p>
      </div>

      {/* Database Browser Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Food Database Browser ({allFoodGroups.length} foods available)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatabase(!showDatabase)}
            >
              {showDatabase ? 'Hide Database' : 'Show Database'}
            </Button>
          </CardTitle>
        </CardHeader>

        {showDatabase && (
          <CardContent className="space-y-6">
            {/* Search Database */}
            <div className="mb-4">
              <Input
                placeholder="Search foods in database..."
                className="max-w-md"
                onChange={e => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (searchTerm) {
                    const filtered = allFoodGroups.filter(
                      food =>
                        food.name.toLowerCase().includes(searchTerm) ||
                        food.category.toLowerCase().includes(searchTerm) ||
                        (food.benefits &&
                          food.benefits.some(benefit =>
                            benefit.toLowerCase().includes(searchTerm)
                          ))
                    );
                    setCategorizedFoods({
                      fruits: filtered.filter(f =>
                        f.category?.toLowerCase().includes('fruit')
                      ),
                      vegetables: filtered.filter(f =>
                        f.category?.toLowerCase().includes('vegetable')
                      ),
                      grains: filtered.filter(
                        f =>
                          f.category?.toLowerCase().includes('grain') ||
                          f.category?.toLowerCase().includes('cereal') ||
                          f.category?.toLowerCase().includes('carbohydrate')
                      ),
                    });
                  } else {
                    // Reset to original categorization
                    const categorized = {
                      fruits: allFoodGroups.filter(f =>
                        f.category?.toLowerCase().includes('fruit')
                      ),
                      vegetables: allFoodGroups.filter(f =>
                        f.category?.toLowerCase().includes('vegetable')
                      ),
                      grains: allFoodGroups.filter(
                        f =>
                          f.category?.toLowerCase().includes('grain') ||
                          f.category?.toLowerCase().includes('cereal') ||
                          f.category?.toLowerCase().includes('carbohydrate')
                      ),
                    };
                    setCategorizedFoods(categorized);
                  }
                }}
              />
            </div>

            {dbLoading && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading food database...</p>
              </div>
            )}

            {dbError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">Database error: {dbError}</p>
              </div>
            )}

            {!dbLoading && !dbError && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fruits Category */}
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    onClick={() => toggleCategory('fruits')}
                  >
                    <h3 className="font-medium text-gray-900">
                      Fruits ({categorizedFoods.fruits.length})
                    </h3>
                    {expandedCategories.fruits ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {expandedCategories.fruits && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {categorizedFoods.fruits.length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-700 text-sm">
                            No fruits found in database
                          </p>
                        </div>
                      ) : (
                        categorizedFoods.fruits.map(food => {
                          return (
                            <div
                              key={food.id || food.name}
                              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {food.name || 'Unknown Name'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {food.benefits?.join(', ') || 'No description'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {food.nutritionFacts?.calories || 0} cal,{' '}
                                {food.nutritionFacts?.protein || 0}g protein
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Category: {food.category || 'Unknown'}
                              </div>
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    addFoodItem('fruits', food.name, setFruits)
                                  }
                                  disabled={fruits.includes(food.name)}
                                  className="w-full text-xs"
                                >
                                  {fruits.includes(food.name)
                                    ? 'Added'
                                    : 'Add to Fruits'}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Vegetables Category */}
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    onClick={() => toggleCategory('vegetables')}
                  >
                    <h3 className="font-medium text-gray-900">
                      Vegetables ({categorizedFoods.vegetables.length})
                    </h3>
                    {expandedCategories.vegetables ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {expandedCategories.vegetables && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {categorizedFoods.vegetables.length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-700 text-sm">
                            No vegetables found in database
                          </p>
                        </div>
                      ) : (
                        categorizedFoods.vegetables.map(food => {
                          return (
                            <div
                              key={food.id || food.name}
                              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {food.name || 'Unknown Name'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {food.benefits?.join(', ') || 'No description'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {food.nutritionFacts?.calories || 0} cal,{' '}
                                {food.nutritionFacts?.protein || 0}g protein
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Category: {food.category || 'Unknown'}
                              </div>
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    addFoodItem(
                                      'vegetables',
                                      food.name,
                                      setVegetables
                                    )
                                  }
                                  disabled={vegetables.includes(food.name)}
                                  className="w-full text-xs"
                                >
                                  {vegetables.includes(food.name)
                                    ? 'Added'
                                    : 'Add to Vegetables'}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Grains Category */}
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    onClick={() => toggleCategory('grains')}
                  >
                    <h3 className="font-medium text-gray-900">
                      Grains ({categorizedFoods.grains.length})
                    </h3>
                    {expandedCategories.grains ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {expandedCategories.grains && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {categorizedFoods.grains.length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-700 text-sm">
                            No grains found in database
                          </p>
                        </div>
                      ) : (
                        categorizedFoods.grains.map(food => {
                          return (
                            <div
                              key={food.id || food.name}
                              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {food.name || 'Unknown Name'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {food.benefits?.join(', ') || 'No description'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {food.nutritionFacts?.calories || 0} cal,{' '}
                                {food.nutritionFacts?.protein || 0}g protein
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Category: {food.category || 'Unknown'}
                              </div>
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    addFoodItem('grains', food.name, setGrains)
                                  }
                                  disabled={grains.includes(food.name)}
                                  className="w-full text-xs"
                                >
                                  {grains.includes(food.name)
                                    ? 'Added'
                                    : 'Add to Grains'}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Meal Planning Interface */}
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create Your Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Food Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FoodSelector
              title="Fruits"
              items={fruits}
              newItem={newFruit}
              setNewItem={setNewFruit}
              onAdd={() => addFoodItem('fruits', newFruit, setFruits)}
              onRemove={item => removeFoodItem('fruits', item)}
              suggestions={[
                'Apple',
                'Banana',
                'Orange',
                'Strawberry',
                'Blueberry',
                'Mango',
                'Pineapple',
                'Grape',
                'Peach',
                'Pear',
              ]}
              onClear={() => setFruits([])}
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
              suggestions={[
                'Spinach',
                'Kale',
                'Broccoli',
                'Carrot',
                'Bell Pepper',
                'Tomato',
                'Cucumber',
                'Onion',
                'Garlic',
                'Sweet Potato',
              ]}
              onClear={() => setVegetables([])}
            />

            <FoodSelector
              title="Grains"
              items={grains}
              newItem={newGrain}
              setNewItem={setNewGrain}
              onAdd={() => addFoodItem('grains', newGrain, setGrains)}
              onRemove={item => removeFoodItem('grains', item)}
              suggestions={[
                'Quinoa',
                'Brown Rice',
                'Oats',
                'Whole Wheat Bread',
                'Barley',
                'Millet',
                'Buckwheat',
                'Farro',
                'Amaranth',
                'Teff',
              ]}
              onClear={() => setGrains([])}
            />
          </div>

          {/* User Preferences */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="userPrompt"
                className="text-sm font-medium text-gray-700"
              >
                Nutrition Goal or Preference
              </Label>
              <Textarea
                id="userPrompt"
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                placeholder="e.g., High protein for muscle building, low carb for weight loss, anti-inflammatory foods..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label
                htmlFor="preferences"
                className="text-sm font-medium text-gray-700"
              >
                Additional Preferences
              </Label>
              <Textarea
                id="preferences"
                value={preferences}
                onChange={e => setPreferences(e.target.value)}
                placeholder="e.g., Quick preparation, budget-friendly, seasonal ingredients..."
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Dietary Restrictions */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Dietary Restrictions
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Vegetarian',
                  'Vegan',
                  'Gluten-Free',
                  'Dairy-Free',
                  'Low-Sodium',
                  'Low-Sugar',
                  'Keto',
                  'Paleo',
                ].map(restriction => (
                  <Badge
                    key={restriction}
                    variant={
                      dietaryRestrictions.includes(restriction)
                        ? 'default'
                        : 'outline'
                    }
                    className={`cursor-pointer ${
                      dietaryRestrictions.includes(restriction)
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleDietaryRestriction(restriction)}
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={handleGenerateMealPlan}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Meal Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Meal Plan
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={clearAllFoods}
              variant="outline"
              size="sm"
              disabled={
                fruits.length === 0 &&
                vegetables.length === 0 &&
                grains.length === 0
              }
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Clear All Foods
            </Button>

            <Button
              onClick={clearAllPreferences}
              variant="outline"
              size="sm"
              disabled={
                !userPrompt.trim() &&
                !preferences.trim() &&
                dietaryRestrictions.length === 0
              }
              className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
            >
              Clear Preferences
            </Button>

            <Button
              onClick={resetAll}
              variant="outline"
              size="sm"
              disabled={
                fruits.length === 0 &&
                vegetables.length === 0 &&
                grains.length === 0 &&
                !userPrompt.trim() &&
                !preferences.trim() &&
                dietaryRestrictions.length === 0
              }
              className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            >
              Reset Everything
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Combinations */}
      {parsedCombinations.length > 0 && (
        <CombinationDisplay
          combinations={parsedCombinations}
          onRegenerate={handleGenerateMealPlan}
        />
      )}

      {mealPlan && parsedCombinations.length === 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              AI Generated Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Raw AI Response (Parsing failed):
              </p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                {mealPlan}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
