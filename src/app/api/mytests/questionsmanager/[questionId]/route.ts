import { NextRequest, NextResponse } from 'next/server';
import { deleteQuestion } from '@/app/actions/questionActions';
import { getServerSession } from 'next-auth';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionId: string } }
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
      { error: 'Unauthorized: Only admin users can delete questions' },
      { status: 403 }
    );
  }

  try {
    const questionId = parseInt(params.questionId);
    await deleteQuestion(questionId);
    
    return NextResponse.json({ 
      message: 'Question deleted successfully' 
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete question'
    }, { status: 500 });
  }
}
