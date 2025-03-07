import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma'
import { getTestDefinitionById } from '@/app/actions/testActions';
import { logger } from '@/app/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email || '' }
  });

  if (!currentUser 
    // || currentUser.userType !== 'ADMIN'
    ) {
    return NextResponse.json(
      { error: 'Unauthorized: Only admin users can view test definition' },
      { status: 403 }
    );
  }

  try {
    const {testId} = await params;
    const testIdParam = parseInt(testId)
    logger.info(`Fetching test definition for testId: ${testIdParam}`);
    const testDefinition = await getTestDefinitionById(testIdParam);
    return NextResponse.json(testDefinition, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch test definition'
    }, { status: 500 });
  }
}
