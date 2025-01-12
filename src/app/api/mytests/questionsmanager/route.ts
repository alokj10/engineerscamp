
import { NextRequest, NextResponse } from 'next/server'
import { createQuestionAnswer, getQuestionsByCategory } from '@/app/actions/questionActions'
import { getServerSession } from 'next-auth'
import { PrismaClient } from "@prisma/client"
import { TestQuestionMappingAtom } from '@/app/store/myTestAtom'
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    const session = await getServerSession()
    
    if (!session?.user 
       // || session.user.userType !== 'ADMIN'
    ) {
        return NextResponse.json(
            { error: 'Unauthorized: Only admin users can create questions' },
            { status: 403 }
        )
    }

    try {
        const testQuestionMapping: TestQuestionMappingAtom = await request.json()
        const result = await createQuestionAnswer(testQuestionMapping)
        
        return NextResponse.json({ 
            message: 'Question and answers created successfully',
            data: result 
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to create question'
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    const session = await getServerSession()
    
    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || undefined
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email || '' }
        })

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const questions = await getQuestionsByCategory(currentUser.id, category)
        
        return NextResponse.json({ 
            data: questions 
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to fetch questions'
        }, { status: 500 })
    }
}
