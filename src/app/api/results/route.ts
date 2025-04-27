import { NextRequest, NextResponse } from 'next/server';
import { getTestResponsesByTestId } from '@/app/actions/resultActions';
import { Logger } from '@/app/utils/logger';

const logger = new Logger();

export async function GET(request: NextRequest) {
  try {
    // Extract testId from URL search params
    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get('testId');

    // Validate testId parameter
    if (!testId) {
      logger.warning('GET /api/results - Missing testId parameter');
      return NextResponse.json(
        { error: 'Missing required parameter: testId' },
        { status: 400 }
      );
    }

    // Convert testId to number
    const testIdNumber = parseInt(testId, 10);
    
    if (isNaN(testIdNumber)) {
      logger.warning(`GET /api/results - Invalid testId format: ${testId}`);
      return NextResponse.json(
        { error: 'Invalid testId format. Must be a number.' },
        { status: 400 }
      );
    }

    // Fetch test responses
    const results = await getTestResponsesByTestId(testIdNumber);
    
    logger.info(`GET /api/results - Successfully retrieved results for testId: ${testId}`);
    return NextResponse.json({ results }, { status: 200 });
    
  } catch (error) {
    // Log and handle errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`GET /api/results - Error: ${errorMessage}`);
    
    return NextResponse.json(
      { error: 'Failed to retrieve test results' },
      { status: 500 }
    );
  }
}