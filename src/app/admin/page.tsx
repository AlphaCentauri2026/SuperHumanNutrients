'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import CSVImport from '@/components/CSVImport';
import {
  Database,
  TestTube,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const initializeDatabase = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/database/init', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          'Database initialized successfully! All default food groups have been created.'
        );
        setMessageType('success');
      } else {
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch {
      setMessage(
        'Failed to initialize database. Please check your connection.'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const testFoodGroupsAPI = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/food-groups');
      const data = await response.json();

      if (data.success) {
        setMessage(
          `API test successful! Found ${data.data.length} food groups in database.`
        );
        setMessageType('success');
      } else {
        setMessage(`API test failed: ${data.error}`);
        setMessageType('error');
      }
    } catch {
      setMessage('API test failed. Please check your connection.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Administration
          </h1>
          <p className="text-gray-600">
            Manage your nutrition database and test connections
          </p>
        </div>

        {/* Database Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={initializeDatabase}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                Initialize Database
              </Button>

              <Button
                onClick={testFoodGroupsAPI}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test Food Groups API
              </Button>
            </div>

            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {messageType === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p
                    className={`font-medium ${
                      messageType === 'success'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CSV Import Section */}
        <CSVImport />

        {/* Database Structure Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Database Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Collections:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    <strong>foodGroups</strong> - Nutritional information for
                    all food items
                  </li>
                  <li>
                    <strong>userPreferences</strong> - User dietary preferences
                    and settings
                  </li>
                  <li>
                    <strong>savedCombinations</strong> - User-saved meal
                    combinations
                  </li>
                  <li>
                    <strong>nutritionGoals</strong> - User nutrition and health
                    goals
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Current Food Groups:
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    Database initialized successfully! Current food groups:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Apple
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Banana
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Spinach
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Quinoa
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Chicken Breast
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Greek Yogurt
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Almonds
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Basil
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Turmeric
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
