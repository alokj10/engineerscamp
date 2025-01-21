
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { activateTest } from "@/app/actions/testActions"
import { TestQuestionMappingAtom } from "@/app/store/myTestAtom"

export async function POST(
    request: NextRequest,
    { params }: { params: { testId: string } }
) {
    try {
        const session = await getServerSession()
        
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            )
        }
        const param = await params;
        const testId = parseInt(param.testId)
        const result = await activateTest(testId)

        return NextResponse.json(
            { message: "Test activated successfully", data: result },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: `Failed to activate test: ${error}` },
            { status: 500 }
        )
    }
}
