import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// AI Detection API route
// Supports: Sightengine (free tier 500/mo), Hive Moderation
// Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET env vars

const SIGHTENGINE_API_USER = process.env.SIGHTENGINE_API_USER
const SIGHTENGINE_API_SECRET = process.env.SIGHTENGINE_API_SECRET

interface DetectionResult {
  file: string
  aiScore: number | null
  isAI: boolean | null
  provider: string
  error?: string
  checkedAt: string
}

// Store results in a JSON file for persistence
const resultsPath = path.join(process.cwd(), 'public', 'content', 'ai-detection-results.json')

function loadResults(): Record<string, DetectionResult> {
  try {
    if (fs.existsSync(resultsPath)) {
      return JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
    }
  } catch (e) {
    console.error('Error loading AI detection results:', e)
  }
  return {}
}

function saveResults(results: Record<string, DetectionResult>) {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))
}

async function detectWithSightengine(imageUrl: string): Promise<{ aiScore: number; isAI: boolean }> {
  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    throw new Error('Sightengine API credentials not configured')
  }

  const params = new URLSearchParams({
    url: imageUrl,
    models: 'genai',
    api_user: SIGHTENGINE_API_USER,
    api_secret: SIGHTENGINE_API_SECRET,
  })

  const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`)
  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error(data.error?.message || 'Sightengine API error')
  }

  // Sightengine returns ai_generated probability
  const aiScore = data.type?.ai_generated || 0
  return {
    aiScore: Math.round(aiScore * 100),
    isAI: aiScore > 0.5
  }
}

export async function GET(request: NextRequest) {
  // Return cached results
  const results = loadResults()
  return NextResponse.json({ 
    results,
    configured: !!(SIGHTENGINE_API_USER && SIGHTENGINE_API_SECRET),
    provider: 'sightengine'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, file } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })
    }

    if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
      return NextResponse.json({ 
        error: 'AI Detection not configured. Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET environment variables.',
        configured: false
      }, { status: 503 })
    }

    const { aiScore, isAI } = await detectWithSightengine(imageUrl)

    const result: DetectionResult = {
      file: file || imageUrl,
      aiScore,
      isAI,
      provider: 'sightengine',
      checkedAt: new Date().toISOString()
    }

    // Save result
    const results = loadResults()
    results[file || imageUrl] = result
    saveResults(results)

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Detection error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Detection failed'
    }, { status: 500 })
  }
}
