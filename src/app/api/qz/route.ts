'use server'
import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
import { getDataForQzSession } from '@/app/actions/qzActions'
import { Logger } from '@/app/utils/logger'
import { getServerSession, unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { getSession, useSession } from 'next-auth/react'
import { DefaultSession } from 'next-auth'

const logger = new Logger()

declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        userType: string;
      } & DefaultSession["user"];
    }
  }
export interface MySession extends DefaultSession {
    user: {
      id: string;
      userType: string;
    } & DefaultSession["user"];
}


  
  
export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const session = await getServerSession(authOptions)
        const s1 = await getSession()
        console.log('quiz api: session', JSON.stringify(session))
        console.log('quiz api: s1', s1)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
        }

        if (session.user.userType !== 'respondent') {
            logger.error(`Invalid user type: ${session.user.userType}`)
            return NextResponse.json({ 
                error: 'Invalid user type. Please clear browser cache and try again'
            }, { status: 403 })
        }

        const testData = await getDataForQzSession(session.user.id)
        return NextResponse.json(testData)

    } catch (error) {
        logger.error(`Error in quiz session: ${error}`)
        return NextResponse.json({ 
            error: 'Failed to load quiz session'
        }, { status: 500 })
    }
}
