
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { saveRespondents, getTestDefinitionById } from '@/app/actions/testActions'
import { TestQuestionMappingAtom } from '@/app/store/myTestAtom'

export async function POST(request: NextRequest) {
    const session = await getServerSession()
    
    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const testData: TestQuestionMappingAtom = await request.json()
        
        await saveRespondents(testData.test.testId, testData.testRespondents)
        
        const updatedTestData = await getTestDefinitionById(testData.test.testId)
        
        return NextResponse.json({ 
            data: updatedTestData
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to save respondents'
        }, { status: 500 })
    }
}
