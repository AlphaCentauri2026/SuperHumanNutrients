import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the AI foods endpoint
    const response = await fetch('/api/ai/foods');

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'AI foods API is working correctly',
        data: data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'AI foods API returned an error',
        status: response.status,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to test AI foods API',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
