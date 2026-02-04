import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

// Simple image generation endpoint
// For full iterate-until-passes, use the CLI script

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCDpWsQ1ctGnUSFFKcS3WNY7NTu1RsVy34'
const SCRIPT_DIR = '/usr/lib/node_modules/clawdbot/skills/nano-banana-pro/scripts'

interface GenerateRequest {
  prompt: string
  inputImage?: string
  filename?: string
}

async function generateImage(prompt: string, outputPath: string, inputImage?: string): Promise<boolean> {
  try {
    const args = [
      `--prompt "${prompt.replace(/"/g, '\\"')}"`,
      `--filename "${outputPath}"`,
      '--resolution 1K'
    ]
    
    if (inputImage) {
      args.push(`--input-image "${inputImage}"`)
    }

    const cmd = `cd ${SCRIPT_DIR} && GEMINI_API_KEY="${GEMINI_API_KEY}" uv run generate_image.py ${args.join(' ')}`
    await execAsync(cmd, { timeout: 120000 })
    return fs.existsSync(outputPath)
  } catch (e) {
    console.error('Generation failed:', e)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { prompt, inputImage, filename } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 })
    }

    const outputDir = path.join(process.cwd(), 'public', 'content', 'ai-ads-v2')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const outputFilename = filename || `gen-${Date.now()}.png`
    const finalPath = path.join(outputDir, outputFilename)

    const success = await generateImage(prompt, finalPath, inputImage)
    
    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image generation failed' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: outputFilename,
      url: `/content/ai-ads-v2/${outputFilename}`,
      message: 'Image generated. Use AI Detect button to check score.'
    })

  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Generation failed'
    }, { status: 500 })
  }
}
