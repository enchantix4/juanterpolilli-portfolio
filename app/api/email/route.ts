import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, country } = data

    if (!email || !country) {
      return NextResponse.json(
        { error: 'Email and country are required' },
        { status: 400 }
      )
    }

    // Read existing emails
    const filePath = path.join(process.cwd(), 'data', 'emails.json')
    let emails: Array<{ email: string; country: string; date: string }> = []

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8')
      emails = JSON.parse(fileData)
    }

    // Add new email
    emails.push({
      email,
      country,
      date: new Date().toISOString(),
    })

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(emails, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving email:', error)
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    )
  }
}


