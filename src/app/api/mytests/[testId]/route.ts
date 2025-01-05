import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma'
import { getTestDefinitionById } from '@/app/actions/testActions';

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
    const testId = parseInt(params.testId)
    const testDefinition = await getTestDefinitionById(testId);
    
    return NextResponse.json(testDefinition, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch test definition'
    }, { status: 500 });
  }
}
