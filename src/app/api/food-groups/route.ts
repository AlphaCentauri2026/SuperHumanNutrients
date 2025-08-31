import { NextRequest, NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let foodGroups;

    if (search) {
      // Search across all food groups
      foodGroups = await foodGroupOperations.search(search);
    } else if (category) {
      // Get food groups by specific category
      foodGroups = await foodGroupOperations.getByCategory(
        category as
          | 'fruits'
          | 'vegetables'
          | 'grains'
          | 'proteins'
          | 'dairy'
          | 'nuts'
          | 'herbs'
          | 'spices'
      );
    } else {
      // Get all food groups
      foodGroups = await foodGroupOperations.getAll();
    }

    return NextResponse.json({
      success: true,
      data: foodGroups,
      count: foodGroups.length,
    });
  } catch (error) {
    console.error('Error fetching food groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch food groups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category || !body.nutrients || !body.benefits) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, category, nutrients, benefits',
        },
        { status: 400 }
      );
    }

    // Create new food group
    const foodGroupId = await foodGroupOperations.create(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Food group created successfully',
        id: foodGroupId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating food group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create food group',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
