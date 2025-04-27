import { NextRequest, NextResponse } from 'next/server';
import { calculateAndUpdateScore, saveResponse } from '@/app/actions/qzActions';
import { QzResponseAtom } from '@/app/store/qzAtom';
import { Logger } from '@/app/utils/logger';
import { TestResponseStatus } from '@/app/Constants';
import { getToken } from 'next-auth/jwt';

const logger = new Logger();
const secret = process.env.NEXTAUTH_SECRET

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { QzSession, QzResponse } = data;
    const token = await getToken({ req: request, secret });

    // if (!data.testId || !data.respondentId || !data.questionAnswers) {
    if (!QzResponse.testId || !QzResponse.respondentId || !QzResponse.questionAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('QzSession', QzSession);
    console.log('QzResponse', QzResponse);
    const result = await saveResponse(QzResponse);

    if(QzResponse.status === TestResponseStatus.Submitted) {
      await calculateAndUpdateScore(QzResponse.testId, QzResponse.respondentId);
    }
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error saving quiz response: ${error}`);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}
