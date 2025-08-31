import { NextRequest, NextResponse } from 'next/server';
import { databaseUtils } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Initialize default food groups
    await databaseUtils.initializeDefaultFoodGroups();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with default food groups',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
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
  return NextResponse.json({
    message: 'Use POST to initialize the database with default food groups',
  });
}
