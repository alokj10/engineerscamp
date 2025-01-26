import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ authenticated: false })
  }
  
  return NextResponse.json({ authenticated: true })
}
