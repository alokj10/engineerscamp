
import { NextResponse } from 'next/server'
import { createTest, getTests } from '@/app/actions/testActions'
import { TestDefinitionAtom, TestQuestionMappingAtom } from '@/app/store/myTestAtom'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
    try {
        const testDefinition: TestDefinitionAtom = await request.json()
        const createdTest = await createTest(testDefinition)
        
        return NextResponse.json(createdTest, { status: 201 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create test'
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
}


export async function GET() {
    try {
        const session = await getServerSession()
        
        if (!session 
            //|| session.user?.role !== 'ADMIN'
            ) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
        }

        const tests: TestDefinitionAtom[] = await getTests()
        return NextResponse.json(tests, { status: 200 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tests'
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
}