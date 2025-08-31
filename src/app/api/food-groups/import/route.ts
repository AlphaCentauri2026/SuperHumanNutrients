import { NextRequest, NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';
import { FoodGroup } from '@/lib/database';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read and parse CSV
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV must have at least a header row and one data row',
        },
        { status: 400 }
      );
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('CSV Headers:', headers);

    // Validate required headers
    const requiredHeaders = ['name', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required headers: ${missingHeaders.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Parse data rows
    const foodGroups: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const errors: string[] = [];
    const successes: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            row[header] = values[index];
          }
        });

        // Validate and transform data
        if (!row.name || !row.category) {
          errors.push(`Row ${i + 1}: Missing name or category`);
          continue;
        }

        // Map CSV columns to database fields
        const getNutritionValue = (value: string, unit: string = '') => {
          if (!value) return 0;
          // Remove units and convert to number
          const cleanValue = value
            .replace(new RegExp(`\\s*${unit}\\s*`, 'gi'), '')
            .trim();
          const num = parseFloat(cleanValue);
          return isNaN(num) ? 0 : num;
        };

        // Create food group object with proper field mapping
        const foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'> = {
          name: row.name,
          category: row.category.toLowerCase() as
            | 'fruits'
            | 'vegetables'
            | 'grains'
            | 'proteins'
            | 'dairy'
            | 'nuts'
            | 'herbs'
            | 'spices', // Convert to lowercase for enum matching
          // description field removed - not in FoodGroup interface
          nutrients: [], // Initialize empty nutrients array
          benefits: [], // Initialize empty benefits array
          subcategory: row.subcategory || '',
          seasonality: (row.seasonality || 'year-round') as
            | 'spring'
            | 'summer'
            | 'fall'
            | 'winter'
            | 'year-round',
          glycemicIndex: parseFloat(row.glycemicindex) || 0,
          caloriesPer100g: getNutritionValue(
            row.caloriesper100g || row.calories,
            '100g'
          ),
          proteinPer100g: getNutritionValue(
            row.proteinper100g || row.protein,
            'g'
          ),
          carbsPer100g: getNutritionValue(row.carbsper100g || row.carbs, 'g'),
          fatPer100g: getNutritionValue(row.fatper100g || row.fat, 'g'),
          fiberPer100g: getNutritionValue(row.fiberper100g || row.fiber, 'g'),
          isActive: true,
        };

        // Add micronutrients to nutrients array if available
        if (row.micronutrients) {
          const micronutrients = row.micronutrients
            .split(';')
            .map((m: string) => m.trim());
          foodGroup.nutrients.push(...micronutrients);
        }

        // Add health benefits to benefits array if available
        if (row['health benefits']) {
          const benefits = row['health benefits']
            .split(';')
            .map((b: string) => b.trim());
          foodGroup.benefits.push(...benefits);
        }

        // Add other data to nutrients array
        if (row['dietary tags']) {
          const dietaryTags = row['dietary tags']
            .split(';')
            .map((t: string) => t.trim());
          foodGroup.nutrients.push(...dietaryTags);
        }

        if (row['cuisine/origin']) {
          foodGroup.nutrients.push(row['cuisine/origin']);
        }

        if (row.pairings) {
          const pairings = row.pairings.split(';').map((p: string) => p.trim());
          foodGroup.nutrients.push(...pairings);
        }

        foodGroups.push(foodGroup);
        successes.push(`Row ${i + 1}: ${row.name} (${row.category})`);
      } catch (error) {
        errors.push(
          `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Import to database
    const importedIds: string[] = [];
    for (const foodGroup of foodGroups) {
      try {
        const id = await foodGroupOperations.create(foodGroup);
        importedIds.push(id);
      } catch (error) {
        errors.push(
          `Failed to import ${foodGroup.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedIds.length} food groups`,
      imported: importedIds.length,
      total: foodGroups.length,
      successes,
      errors,
      sampleData: foodGroups.slice(0, 3), // Return first 3 for preview
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process CSV file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to upload CSV file',
    requiredHeaders: ['name', 'category'],
    optionalHeaders: [
      'description',
      'caloriesPer100g',
      'proteinPer100g',
      'carbsPer100g',
      'fatPer100g',
      'fiberPer100g',
      'nutrients',
      'benefits',
      'subcategory',
      'seasonality',
      'glycemicIndex',
    ],
    format: 'CSV with comma-separated values',
    example:
      'name,category,description,caloriesPer100g,proteinPer100g,carbsPer100g,fatPer100g,fiberPer100g,nutrients,benefits,subcategory,seasonality,glycemicIndex',
  });
}
