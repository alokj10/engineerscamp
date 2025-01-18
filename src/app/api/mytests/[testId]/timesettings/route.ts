
import { NextRequest, NextResponse } from 'next/server';
import { saveTimeSettings } from '@/app/actions/testActions';
import { TestQuestionMappingAtom } from '@/app/store/myTestAtom';
import { getServerSession } from 'next-auth';
import { logger } from '@/app/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: TestQuestionMappingAtom = await request.json();
    
    const result = await saveTimeSettings(
      body.test.testId,
      body.test
    );

    return NextResponse.json(
      { message: 'Time settings saved successfully', data: result },
      { status: 200 }
    );

  } catch (error) {
    let errorMessage = `Failed to save time settings: ${error}`;
    logger.error(errorMessage);
    return NextResponse.json(
      { error: 'Failed to save time settings' },
      { status: 500 }
    );
  }
}
