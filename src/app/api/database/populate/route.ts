import { NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('[database/populate] Starting database population...');

    // Check if we already have food groups
    const existingFoodGroups = await foodGroupOperations.getAll();
    console.log(
      `[database/populate] Found ${existingFoodGroups.length} existing food groups`
    );

    if (existingFoodGroups.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already contains ${existingFoodGroups.length} food groups`,
        existingCount: existingFoodGroups.length,
        action: 'no_action_needed',
      });
    }

    // Import from the expanded foods database CSV
    console.log(
      '[database/populate] Importing from expanded foods database CSV...'
    );
    const csvPath = path.join(process.cwd(), 'expanded_foods_database.csv');

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV file not found',
          details: 'expanded_foods_database.csv not found in project root',
        },
        { status: 404 }
      );
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid CSV file',
          details: 'CSV must have at least a header row and one data row',
        },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('[database/populate] CSV Headers:', headers);

    let importedCount = 0;
    const errors: string[] = [];

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

        // Create food group object
        const foodGroup = {
          name: row.name,
          category: row.category.toLowerCase() as
            | 'fruits'
            | 'vegetables'
            | 'grains'
            | 'proteins'
            | 'dairy'
            | 'nuts'
            | 'herbs'
            | 'spices',
          subcategory: row.subcategory || '',
          nutrients: row.nutrients
            ? row.nutrients.split(';').map(n => n.trim())
            : [],
          benefits: row.benefits
            ? row.benefits.split(';').map(b => b.trim())
            : [],
          seasonality: (row.seasonality || 'year-round') as
            | 'spring'
            | 'summer'
            | 'fall'
            | 'winter'
            | 'year-round',
          glycemicIndex: parseFloat(row.glycemicindex) || 0,
          caloriesPer100g: parseFloat(row.caloriesper100g) || 0,
          proteinPer100g: parseFloat(row.proteinper100g) || 0,
          carbsPer100g: parseFloat(row.carbsper100g) || 0,
          fatPer100g: parseFloat(row.fatper100g) || 0,
          fiberPer100g: parseFloat(row.fiberper100g) || 0,
          isActive: true,
        };

        await foodGroupOperations.create(foodGroup);
        importedCount++;

        if (importedCount % 10 === 0) {
          console.log(
            `[database/populate] Imported ${importedCount} food groups...`
          );
        }
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`[database/populate] ${errorMsg}`);
      }
    }

    console.log(
      `[database/populate] Successfully imported ${importedCount} food groups from CSV`
    );

    return NextResponse.json({
      success: true,
      message: `Database populated successfully with ${importedCount} food groups`,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      action: 'csv_import',
    });
  } catch (error) {
    console.error('[database/populate] Database population error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to populate database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const existingFoodGroups = await foodGroupOperations.getAll();
    return NextResponse.json({
      success: true,
      message: 'Database population status',
      foodGroupsCount: existingFoodGroups.length,
      status: existingFoodGroups.length === 0 ? 'EMPTY' : 'POPULATED',
      action:
        existingFoodGroups.length === 0
          ? 'Use POST to populate the database with food data'
          : 'Database is already populated',
    });
  } catch (error) {
    console.error('[database/populate] Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
