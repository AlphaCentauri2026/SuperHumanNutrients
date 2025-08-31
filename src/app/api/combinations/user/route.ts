import { NextRequest, NextResponse } from 'next/server';
import { savedCombinationsOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const favorites = searchParams.get('favorites') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    let combinations;

    if (favorites) {
      // Get only favorite combinations
      combinations = await savedCombinationsOperations.getFavorites(userId);
    } else {
      // Get all combinations for the user (simplified query)
      combinations = await savedCombinationsOperations.getByUserId(userId);
    }

    return NextResponse.json({
      success: true,
      data: combinations,
    });
  } catch (error) {
    console.error('Error fetching user combinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user combinations' },
      { status: 500 }
    );
  }
}
