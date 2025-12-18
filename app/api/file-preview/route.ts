import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { extname, join } from 'path'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif']

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')
    
    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Handle portfolio images - return error to force using direct static paths
    // Portfolio images should be accessed directly via /images/portfolio/... 
    // This avoids the 250MB serverless function limit on Vercel
    if (filePath.startsWith('portfolio:')) {
      return NextResponse.json({ 
        error: 'Portfolio images should be accessed via static paths',
        message: 'Use /images/portfolio/... instead of /api/file-preview for portfolio images'
      }, { status: 400 })
    }

    // Only allow local file system access in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'File preview is only available in local development environment',
        message: 'This feature requires local file system access'
      }, { status: 403 })
    }

    // Security: Only allow paths that start with /Users/ (macOS user directories)
    if (!filePath.startsWith('/Users/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    // Check if it's an image file
    const ext = extname(filePath).toLowerCase()
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Not an image file' }, { status: 400 })
    }

    try {
      const fileBuffer = await readFile(filePath)
      
      // Determine content type based on extension
      const contentTypeMap: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
      }
      
      const contentType = contentTypeMap[ext] || 'application/octet-stream'
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      if (err.code === 'EACCES') {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      }
      throw err
    }
  } catch (error: any) {
    console.error('Error serving file:', error)
    return NextResponse.json({ 
      error: 'Failed to serve file',
      details: error.message || String(error)
    }, { status: 500 })
  }
}

