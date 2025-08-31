import { NextRequest, NextResponse } from 'next/server';
import { savedCombinationsOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.userId ||
      !body.name ||
      !body.fruits ||
      !body.vegetables ||
      !body.grains
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: userId, name, fruits, vegetables, grains',
        },
        { status: 400 }
      );
    }

    // Save the combination
    const combinationId = await savedCombinationsOperations.save(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Combination saved successfully',
        id: combinationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving combination:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save combination',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
