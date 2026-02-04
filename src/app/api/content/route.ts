import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ContentSet {
  id: string
  date: string
  headline: string
  caption: string
  slides: string[]
  status: 'pending' | 'approved' | 'posted'
  zipUrl?: string
  style: string
}

interface AIImage {
  id: string
  file: string
  url: string
  prompt: string
  category: 'ai-ads' | 'product-ads' | 'meta-ads'
  style: 'minimal' | 'lifestyle' | 'product'
}

function inferStyle(filename: string, prompt: string): 'minimal' | 'lifestyle' | 'product' {
  const combined = (filename + ' ' + prompt).toLowerCase()
  if (combined.includes('lifestyle') || combined.includes('portrait') || combined.includes('person') || combined.includes('morning') || combined.includes('community') || combined.includes('running')) {
    return 'lifestyle'
  }
  if (combined.includes('product') || combined.includes('bottle') || combined.includes('serum') || combined.includes('flat-lay') || combined.includes('arrangement') || combined.includes('hero')) {
    return 'product'
  }
  return 'minimal'
}

export async function GET() {
  const contentDir = path.join(process.cwd(), 'public', 'content')
  
  const contentSets: ContentSet[] = []
  const aiImages: AIImage[] = []
  
  try {
    const dirs = fs.readdirSync(contentDir)
    
    for (const dir of dirs) {
      const dirPath = path.join(contentDir, dir)
      const stat = fs.statSync(dirPath)
      
      if (!stat.isDirectory()) continue
      
      // Handle content sets (set1, set2, etc.)
      if (dir.startsWith('set')) {
        const metadataPath = path.join(dirPath, 'metadata.json')
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
          const files = fs.readdirSync(dirPath)
          const slides = files
            .filter(f => f.startsWith('slide') && f.endsWith('.png'))
            .sort()
            .map(f => `/content/${dir}/${f}`)
          
          contentSets.push({
            id: metadata.id || dir,
            date: metadata.generatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            headline: metadata.headline || '',
            caption: metadata.caption || '',
            slides,
            status: 'pending',
            zipUrl: `/content/${dir}/slides.zip`,
            style: metadata.style || 'ro-minimal'
          })
        }
      }
      
      // Handle AI image galleries
      if (dir === 'ai-ads' || dir === 'ai-ads-v2' || dir === 'product-ads' || dir === 'meta-ads') {
        const promptsPath = path.join(dirPath, 'prompts.json')
        let prompts: { prompt: string; file: string }[] = []
        
        if (fs.existsSync(promptsPath)) {
          prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'))
        }
        
        const files = fs.readdirSync(dirPath)
        const images = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
        
        for (const file of images) {
          const promptEntry = prompts.find(p => p.file === file)
          const prompt = promptEntry?.prompt || ''
          
          // Map directories to categories
          let category: 'ai-ads' | 'product-ads' | 'meta-ads' = 'ai-ads'
          if (dir === 'meta-ads') category = 'meta-ads'
          else if (dir === 'product-ads') category = 'product-ads'
          else if (dir === 'ai-ads-v2' || dir === 'ai-ads') category = 'ai-ads'
          
          aiImages.push({
            id: `${dir}-${file}`,
            file,
            url: `/content/${dir}/${file}`,
            prompt,
            category,
            style: inferStyle(file, prompt)
          })
        }
      }
    }
    
    // Sort content sets by id
    contentSets.sort((a, b) => {
      const numA = parseInt(a.id.replace('set', ''))
      const numB = parseInt(b.id.replace('set', ''))
      return numA - numB
    })
    
    return NextResponse.json({ contentSets, aiImages })
  } catch (error) {
    console.error('Error reading content directory:', error)
    return NextResponse.json({ contentSets: [], aiImages: [] })
  }
}
