import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'public', 'content')
const STATUS_FILE = path.join(CONTENT_DIR, 'status.json')

interface ContentSet {
  id: string
  date: string
  caption: string
  slides: string[]
  status: 'pending' | 'approved' | 'posted'
  zipUrl: string
}

function loadStatus(): Record<string, string> {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'))
    }
  } catch {}
  return {}
}

function saveStatus(status: Record<string, string>) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2))
}

export async function GET() {
  try {
    const status = loadStatus()
    const content: ContentSet[] = []
    
    if (!fs.existsSync(CONTENT_DIR)) {
      return NextResponse.json({ content: [] })
    }
    
    const dirs = fs.readdirSync(CONTENT_DIR).filter(d => {
      const fullPath = path.join(CONTENT_DIR, d)
      return fs.statSync(fullPath).isDirectory() && d.startsWith('set')
    })
    
    for (const dir of dirs) {
      const metaPath = path.join(CONTENT_DIR, dir, 'metadata.json')
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
        content.push({
          id: meta.id || dir,
          date: meta.generatedAt?.split('T')[0] || 'Unknown',
          caption: meta.caption || '',
          slides: [1, 2, 3, 4].map(i => `/content/${dir}/slide${i}.png`),
          status: (status[meta.id] as ContentSet['status']) || 'pending',
          zipUrl: `/content/${dir}/slides.zip`
        })
      }
    }
    
    // Sort by date descending
    content.sort((a, b) => b.date.localeCompare(a.date))
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error loading content:', error)
    return NextResponse.json({ content: [], error: 'Failed to load content' })
  }
}

export async function POST(request: Request) {
  try {
    const { id, status: newStatus } = await request.json()
    const statusMap = loadStatus()
    statusMap[id] = newStatus
    saveStatus(statusMap)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' })
  }
}
