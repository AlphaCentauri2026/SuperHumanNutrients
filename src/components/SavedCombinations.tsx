'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Heart,
  Trash2,
  Edit,
  Star,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { SavedCombination } from '@/lib/database';

export function SavedCombinations() {
  const { user } = useAuth();
  const {
    getUserCombinations,
    deleteCombination,
    toggleFavorite,
    loading,
    error,
    clearError,
  } = useDatabase();
  const [combinations, setCombinations] = useState<SavedCombination[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCombinations();
    }
  }, [user, showFavoritesOnly]);

  const loadCombinations = async () => {
    try {
      const data = await getUserCombinations(user!.uid, showFavoritesOnly);
      setCombinations(data);
    } catch (err) {
      console.error('Failed to load combinations:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this combination?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCombination(id);
      setCombinations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete combination:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, !currentStatus);
      setCombinations(prev =>
        prev.map(c => (c.id === id ? { ...c, isFavorite: !currentStatus } : c))
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const formatDate = (
    timestamp: Date | { toDate: () => Date } | string | number
  ) => {
    if (!timestamp) return 'Unknown date';

    let date: Date;
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            Sign In Required
          </h3>
          <p className="text-blue-700">
            Please sign in to view your saved combinations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Saved Combinations
          </h2>
          <p className="text-gray-600">
            {showFavoritesOnly
              ? 'Your favorite combinations'
              : 'All your saved combinations'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? 'outline' : 'default'}
            onClick={() => setShowFavoritesOnly(false)}
            size="sm"
          >
            All ({combinations.length})
          </Button>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(true)}
            size="sm"
          >
            <Heart className="w-4 h-4 mr-2" />
            Favorites ({combinations.filter(c => c.isFavorite).length})
          </Button>
        </div>
      </div>

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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your combinations...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && combinations.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showFavoritesOnly ? 'No Favorites Yet' : 'No Saved Combinations'}
            </h3>
            <p className="text-gray-600">
              {showFavoritesOnly
                ? 'Start saving your favorite combinations to see them here.'
                : 'Generate some combinations and save them to get started.'}
            </p>
          </div>
        </div>
      )}

      {/* Combinations Grid */}
      {!loading && combinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinations.map(combination => (
            <Card
              key={combination.id}
              className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {combination.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleToggleFavorite(
                          combination.id,
                          combination.isFavorite
                        )
                      }
                      className={`p-1 rounded-full transition-colors ${
                        combination.isFavorite
                          ? 'text-yellow-300 hover:bg-white/20'
                          : 'text-white/70 hover:bg-white/20'
                      }`}
                      title={
                        combination.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${combination.isFavorite ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Ingredients */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">
                    Ingredients:
                  </h4>

                  {combination.fruits.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <span className="text-xs font-medium text-red-700">
                        Fruits:
                      </span>
                      <p className="text-sm text-gray-700">
                        {combination.fruits.join(', ')}
                      </p>
                    </div>
                  )}

                  {combination.vegetables.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <span className="text-xs font-medium text-green-700">
                        Vegetables:
                      </span>
                      <p className="text-sm text-gray-700">
                        {combination.vegetables.join(', ')}
                      </p>
                    </div>
                  )}

                  {combination.grains.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <span className="text-xs font-medium text-amber-700">
                        Grains:
                      </span>
                      <p className="text-sm text-gray-700">
                        {combination.grains.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                {combination.benefits.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm mb-2">
                      Health Benefits:
                    </h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {combination.benefits.join(', ')}
                    </p>
                  </div>
                )}

                {/* Preparation */}
                {combination.preparation && (
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm mb-2">
                      Preparation:
                    </h5>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {combination.preparation}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(combination.createdAt)}
                  </div>
                  {combination.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      {combination.rating}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      /* TODO: Implement edit functionality */
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(combination.id)}
                    disabled={deletingId === combination.id}
                  >
                    {deletingId === combination.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    {deletingId === combination.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
