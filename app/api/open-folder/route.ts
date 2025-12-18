import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Only allow folder opening in development/local environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Folder opening is only available in local development environment',
      message: 'This feature requires local file system access'
    }, { status: 403 })
  }

  const { folderPath } = await request.json()
  
  if (!folderPath?.startsWith('/Users/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
  }

  // Execute open command asynchronously and return immediately
  exec(`open "${folderPath}"`, (error) => {
    if (error) console.error('Error opening folder:', error)
  })

  // Return immediately without waiting
  return NextResponse.json({ success: true })
}

