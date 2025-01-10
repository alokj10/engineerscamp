
import { NextResponse } from 'next/server'
import { createCategory, getCategories } from '@/app/actions/testActions'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
    try {
        const category = await request.json()
        const createdCategory = await createCategory(category.name)
        
        return NextResponse.json(createdCategory, { status: 201 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
}

export async function GET() {
    try {
        const session = await getServerSession()
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
        }

        const categories = await getCategories()
        return NextResponse.json(categories, { status: 200 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
}
