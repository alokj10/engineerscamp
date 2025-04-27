import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.NEXTAUTH_SECRET

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ authenticated: false })
  }
  
  return NextResponse.json({ authenticated: true })
}

export async function POST(request: NextRequest, response: NextResponse) {
  const session = await getServerSession()
  const token = await getToken({ req: request, secret })
  console.log('user check token:', JSON.stringify(token))


  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({ authenticated: true })
}