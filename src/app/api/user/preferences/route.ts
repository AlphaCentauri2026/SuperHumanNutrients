import { NextRequest, NextResponse } from 'next/server';
import { userPreferencesOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const preferences = await userPreferencesOperations.get(userId);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Create or update user preferences
    await userPreferencesOperations.upsert(body.userId, body);

    return NextResponse.json({
      success: true,
      message: 'User preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save user preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Update specific preference fields
    await userPreferencesOperations.update(body.userId, body);

    return NextResponse.json({
      success: true,
      message: 'User preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
