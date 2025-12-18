import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

export async function POST(request: NextRequest) {
  // Only allow file opening in development/local environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'File opening is only available in local development environment',
      message: 'This feature requires local file system access'
    }, { status: 403 })
  }

  const { filePath } = await request.json()
  
  if (!filePath?.startsWith('/Users/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
  }

  // Execute open command asynchronously and return immediately
  exec(`open "${filePath}"`, (error) => {
    if (error) console.error('Error opening file:', error)
  })

  // Return immediately without waiting
  return NextResponse.json({ success: true })
}

