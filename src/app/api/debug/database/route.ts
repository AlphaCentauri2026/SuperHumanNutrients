import { NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';

export async function GET() {
  try {
    console.log('[debug/database] Testing database connection...');
    console.log('[debug/database] Environment check:', {
      isServer: typeof window === 'undefined',
      hasFirebaseConfig: !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ),
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? 'SET'
        : 'NOT_SET',
      firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? 'SET'
        : 'NOT_SET',
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? 'SET'
        : 'NOT_SET',
    });

    // Test basic database operations
    console.log(
      '[debug/database] Attempting to call foodGroupOperations.getAll()...'
    );
    const allFoodGroups = await foodGroupOperations.getAll();

    console.log(
      `[debug/database] Successfully retrieved ${allFoodGroups.length} food groups`
    );

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        totalFoodGroups: allFoodGroups.length,
        sampleFoodGroups: allFoodGroups.slice(0, 3).map(fg => ({
          id: fg.id,
          name: fg.name,
          category: fg.category,
          isActive: fg.isActive,
        })),
        categories: {
          fruits: allFoodGroups.filter(f => f.category === 'fruits').length,
          vegetables: allFoodGroups.filter(f => f.category === 'vegetables')
            .length,
          grains: allFoodGroups.filter(f => f.category === 'grains').length,
          proteins: allFoodGroups.filter(f => f.category === 'proteins').length,
          dairy: allFoodGroups.filter(f => f.category === 'dairy').length,
          nuts: allFoodGroups.filter(f => f.category === 'nuts').length,
          herbs: allFoodGroups.filter(f => f.category === 'herbs').length,
          spices: allFoodGroups.filter(f => f.category === 'spices').length,
        },
        status: allFoodGroups.length === 0 ? 'EMPTY_DATABASE' : 'POPULATED',
        recommendation:
          allFoodGroups.length === 0
            ? 'Database is empty. Run POST /api/database/init to populate it with food data.'
            : 'Database is populated and ready to use.',
      },
    });
  } catch (error) {
    console.error('[debug/database] Database connection failed:', error);
    console.error('[debug/database] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        recommendation:
          'Check Firebase configuration and environment variables',
      },
      { status: 500 }
    );
  }
}
