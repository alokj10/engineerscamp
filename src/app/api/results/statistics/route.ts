import { NextRequest, NextResponse } from 'next/server';
import { getTestStatistics } from '@/app/actions/resultActions';

// Simple console logging function that won't cause build issues
const logToConsole = (level: string, message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level}] ${message}`);
  }
};

export async function GET(request: NextRequest) {
  try {
    // Extract testId from URL search params
    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get('testId');

    // Validate testId parameter
    if (!testId) {
      logToConsole('WARNING', 'GET /api/results/statistics - Missing testId parameter');
      return NextResponse.json(
        { error: 'Missing required parameter: testId' },
        { status: 400 }
      );
    }

    // Convert testId to number
    const testIdNumber = parseInt(testId, 10);
    
    if (isNaN(testIdNumber)) {
      logToConsole('WARNING', `GET /api/results/statistics - Invalid testId format: ${testId}`);
      return NextResponse.json(
        { error: 'Invalid testId format. Must be a number.' },
        { status: 400 }
      );
    }

    // Fetch test responses
    const results = await getTestStatistics(testIdNumber);
    
    logToConsole('INFO', `GET /api/results/statistics - Successfully retrieved results for testId: ${testId}`);
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    // Log and handle errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logToConsole('ERROR', `GET /api/results - Error: ${errorMessage}`);
    
    return NextResponse.json(
      { error: 'Failed to retrieve test results' },
      { status: 500 }
    );
  }
}
