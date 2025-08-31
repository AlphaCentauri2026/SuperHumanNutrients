import { NextResponse } from 'next/server';
import { databaseUtils } from '@/lib/database';
import { foodGroupOperations } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('[database/init] Starting database initialization...');

    // First, check if we already have food groups
    let existingFoodGroups;
    try {
      existingFoodGroups = await foodGroupOperations.getAll();
      console.log(
        `[database/init] Found ${existingFoodGroups.length} existing food groups`
      );

      if (existingFoodGroups.length > 0) {
        return NextResponse.json({
          success: true,
          message: `Database already contains ${existingFoodGroups.length} food groups`,
          existingCount: existingFoodGroups.length,
          action: 'no_action_needed',
        });
      }
    } catch (dbError) {
      console.error(
        '[database/init] Database not available, Firebase may not be configured:',
        dbError
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Database not available',
          details:
            'Firebase configuration is required for database operations. Please check your environment variables.',
          fallback: true,
          message: 'Use fallback data instead',
        },
        { status: 503 }
      ); // Service Unavailable
    }

    // Initialize default food groups
    console.log('[database/init] Initializing default food groups...');
    await databaseUtils.initializeDefaultFoodGroups();

    // Try to import from the expanded foods database CSV
    try {
      console.log(
        '[database/init] Attempting to import expanded foods database...'
      );
      const csvPath = path.join(process.cwd(), 'expanded_foods_database.csv');

      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());

        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          console.log('[database/init] CSV Headers:', headers);

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
                  `[database/init] Imported ${importedCount} food groups...`
                );
              }
            } catch (error) {
              const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              errors.push(errorMsg);
              console.error(`[database/init] ${errorMsg}`);
            }
          }

          console.log(
            `[database/init] Successfully imported ${importedCount} food groups from CSV`
          );

          return NextResponse.json({
            success: true,
            message: `Database initialized successfully with ${importedCount} food groups from CSV`,
            importedCount,
            errors: errors.length > 0 ? errors : undefined,
            action: 'csv_import',
          });
        }
      }
    } catch (csvError) {
      console.error(
        '[database/init] CSV import failed, falling back to defaults:',
        csvError
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with default food groups',
      action: 'default_import',
    });
  } catch (error) {
    console.error('[database/init] Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
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
      message: 'Database status check',
      foodGroupsCount: existingFoodGroups.length,
      categories: {
        fruits: existingFoodGroups.filter(f => f.category === 'fruits').length,
        vegetables: existingFoodGroups.filter(f => f.category === 'vegetables')
          .length,
        grains: existingFoodGroups.filter(f => f.category === 'grains').length,
        proteins: existingFoodGroups.filter(f => f.category === 'proteins')
          .length,
        dairy: existingFoodGroups.filter(f => f.category === 'dairy').length,
        nuts: existingFoodGroups.filter(f => f.category === 'nuts').length,
        herbs: existingFoodGroups.filter(f => f.category === 'herbs').length,
        spices: existingFoodGroups.filter(f => f.category === 'spices').length,
      },
    });
  } catch (error) {
    console.error('[database/init] Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database not available',
        details:
          'Firebase configuration is required for database operations. Please check your environment variables.',
        fallback: true,
        message: 'Use fallback data instead',
      },
      { status: 503 } // Service Unavailable
    );
  }
}
