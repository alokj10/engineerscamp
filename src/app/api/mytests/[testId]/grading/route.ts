
import { NextRequest, NextResponse } from 'next/server'
import { saveGradingSettings } from '@/app/actions/testActions'
import { TestQuestionMappingAtom } from '@/app/store/myTestAtom'
import { logger } from '@/app/utils/logger'
import { getServerSession } from 'next-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    logger.info('Start processing grading settings update')

    const session = await getServerSession()
    if (!session) {
      logger.warning('Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const testQuestionMapping: TestQuestionMappingAtom = await request.json()
    
    const result = await saveGradingSettings(
      testQuestionMapping.test.testId,
      testQuestionMapping.test
    )

    logger.info('Successfully processed grading settings update')
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    logger.error(`Failed to save grading settings: ${error}`)
    return NextResponse.json(
      { error: 'Failed to save grading settings' },
      { status: 500 }
    )
  }
}