'use server'
import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
import { getDataForQzSession } from '@/app/actions/qzActions'
import { Logger } from '@/app/utils/logger'
import { getServerSession, unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { getSession, useSession } from 'next-auth/react'
import { DefaultSession, Session } from 'next-auth'
import { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'

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

type UserSession = Session & {
    user: {
      id: string;
      userType: string;
    }
}
  
const secret = process.env.NEXTAUTH_SECRET
  
export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const session = await getServerSession(authOptions)
        console.log('quiz api: session', JSON.stringify(session))
        const token = await getToken({ req: request, secret })
        console.log('quiz api: token', JSON.stringify(token))

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
        }

        // if (session.user?.userType !== 'respondent') {
        //     logger.error(`Invalid user type: ${session.user.userType}`)
        //     return NextResponse.json({ 
        //         error: 'Invalid user type. Please clear browser cache and try again'
        //     }, { status: 403 })
        // }
        if(!token?.sub) {
          logger.error(`Invalid user type: ${session.user.userType}`)
            return NextResponse.json({ 
                error: 'Invalid user type. Please clear browser cache and try again'
            }, { status: 403 })
        }

        const testData = await getDataForQzSession(Number(token?.sub))
        return NextResponse.json(testData)

    } catch (error) {
        logger.error(`Error in quiz session: ${error}`)
        return NextResponse.json({ 
            error: 'Failed to load quiz session'
        }, { status: 500 })
    }
}
