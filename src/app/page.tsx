'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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
  category: 'ai-ads' | 'product-ads'
  style: 'minimal' | 'lifestyle' | 'product'
}

type ViewMode = 'carousel' | 'gallery'
type StatusFilter = 'all' | 'pending' | 'approved' | 'posted'
type StyleFilter = 'all' | 'minimal' | 'lifestyle' | 'product'
type GalleryCategory = 'all' | 'ai-ads' | 'product-ads'

export default function Dashboard() {
  const [contentSets, setContentSets] = useState<ContentSet[]>([])
  const [aiImages, setAiImages] = useState<AIImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSet, setSelectedSet] = useState<ContentSet | null>(null)
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all')
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>('all')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContentSets(data.contentSets || [])
        setAiImages(data.aiImages || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredContent = contentSets.filter(c => 
    (statusFilter === 'all' || c.status === statusFilter)
  )

  const filteredImages = aiImages.filter(img =>
    (styleFilter === 'all' || img.style === styleFilter) &&
    (galleryCategory === 'all' || img.category === galleryCategory)
  )

  const updateStatus = (id: string, status: ContentSet['status']) => {
    setContentSets(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    posted: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  }

  const styleColors = {
    minimal: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    lifestyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    product: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-white/60 animate-pulse">Loading content...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 flex items-center justify-center text-2xl shadow-lg shadow-teal-500/25">
                  🧬
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  HairDAO Content
                </h1>
                <p className="text-sm text-white/40">Instagram Content Pipeline</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'carousel'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                📱 Carousels
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'gallery'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                🖼️ AI Gallery
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sets', value: contentSets.length, icon: '📚', color: 'from-violet-500 to-purple-600' },
            { label: 'Pending', value: contentSets.filter(c => c.status === 'pending').length, icon: '⏳', color: 'from-amber-500 to-orange-600' },
            { label: 'Approved', value: contentSets.filter(c => c.status === 'approved').length, icon: '✅', color: 'from-emerald-500 to-green-600' },
            { label: 'AI Images', value: aiImages.length, icon: '🎨', color: 'from-cyan-500 to-blue-600' },
          ].map(stat => (
            <div 
              key={stat.label} 
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 border border-white/[0.06] transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {viewMode === 'carousel' ? (
          <>
            {/* Carousel View Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-white/40 text-sm">Filter:</span>
              {(['all', 'pending', 'approved', 'posted'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === f
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map(item => (
                <div
                  key={item.id}
                  className="group bg-white/[0.03] rounded-3xl border border-white/[0.06] overflow-hidden hover:border-teal-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
                  onClick={() => { setSelectedSet(item); setCurrentSlide(0); }}
                >
                  {/* Image Preview Grid */}
                  <div className="relative aspect-square p-2 bg-gradient-to-b from-black/20 to-transparent">
                    <div className="grid grid-cols-2 gap-2 h-full">
                      {item.slides.slice(0, 4).map((slide, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden bg-white/5">
                          <img 
                            src={slide} 
                            alt={`Slide ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {i === 3 && item.slides.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold">+{item.slides.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Slide count badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/80 font-medium">
                      {item.slides.length} slides
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 text-sm">{item.date}</span>
                        {item.headline && (
                          <span className="text-teal-400 font-semibold text-sm">{item.headline}</span>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm line-clamp-2 mb-4 leading-relaxed">{item.caption}</p>
                    
                    <div className="flex gap-2">
                      {item.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'approved'); }}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2.5 rounded-xl text-sm font-semibold transition-all border border-emerald-500/20"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {item.status === 'approved' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'posted'); }}
                          className="flex-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 py-2.5 rounded-xl text-sm font-semibold transition-all border border-sky-500/20"
                        >
                          📤 Mark Posted
                        </button>
                      )}
                      <a
                        href={item.zipUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all border border-white/10"
                      >
                        ⬇️
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/40 text-lg">No content sets found</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Gallery View Filters */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">Style:</span>
                {(['all', 'minimal', 'lifestyle', 'product'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStyleFilter(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      styleFilter === s
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">Category:</span>
                {(['all', 'ai-ads', 'product-ads'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setGalleryCategory(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      galleryCategory === c
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                    }`}
                  >
                    {c === 'all' ? 'All' : c === 'ai-ads' ? '🎨 AI Ads' : '📦 Product Ads'}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map(img => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 cursor-pointer border border-white/[0.06] hover:border-teal-500/30 transition-all duration-300"
                >
                  <img 
                    src={img.url} 
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border backdrop-blur-sm ${styleColors[img.style]}`}>
                      {img.style}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/50 text-white/70 backdrop-blur-sm">
                      {img.category === 'ai-ads' ? '🎨' : '📦'}
                    </span>
                  </div>
                  
                  {/* Prompt preview on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white/90 text-xs line-clamp-2 leading-relaxed">{img.prompt || 'No prompt available'}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-white/40 text-lg">No images found with selected filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Set Modal */}
      {selectedSet && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-6"
          onClick={() => setSelectedSet(null)}
        >
          <div 
            className="bg-gradient-to-b from-[#15151f] to-[#0f0f18] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#15151f]/95 backdrop-blur-sm z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{selectedSet.headline || selectedSet.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedSet.status]}`}>
                    {selectedSet.status}
                  </span>
                </div>
                <p className="text-white/40 text-sm mt-1">{selectedSet.date} • {selectedSet.slides.length} slides</p>
              </div>
              <button
                onClick={() => setSelectedSet(null)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
            
            {/* Carousel Preview */}
            <div className="p-6">
              <div className="relative mb-6">
                <div className="aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden bg-white/5 shadow-xl">
                  <img 
                    src={selectedSet.slides[currentSlide]} 
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Navigation arrows */}
                {selectedSet.slides.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide(prev => prev === 0 ? selectedSet.slides.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentSlide(prev => prev === selectedSet.slides.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
                    >
                      →
                    </button>
                  </>
                )}
                
                {/* Slide indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {selectedSet.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentSlide ? 'bg-teal-500 w-6' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Thumbnail strip */}
              <div className="flex gap-2 justify-center mb-6 overflow-x-auto pb-2">
                {selectedSet.slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === currentSlide ? 'border-teal-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={slide} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Caption */}
              <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-sm font-medium">Caption</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedSet.caption)
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="text-white leading-relaxed">{selectedSet.caption}</p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <a 
                  href={selectedSet.zipUrl} 
                  download
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white py-3.5 rounded-xl font-semibold transition-all text-center shadow-lg shadow-teal-500/25"
                >
                  ⬇️ Download All Slides
                </a>
                {selectedSet.status === 'pending' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedSet.id, 'approved')
                      setSelectedSet({ ...selectedSet, status: 'approved' })
                    }}
                    className="px-6 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-3.5 rounded-xl font-semibold transition-all border border-emerald-500/30"
                  >
                    ✓ Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.prompt}
                className="w-full h-auto"
              />
            </div>
            
            <div className="mt-4 bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${styleColors[selectedImage.style]}`}>
                  {selectedImage.style}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 text-white/70">
                  {selectedImage.category === 'ai-ads' ? '🎨 AI Ads' : '📦 Product Ads'}
                </span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{selectedImage.prompt || 'No prompt available'}</p>
              
              <div className="flex gap-3 mt-4">
                <a 
                  href={selectedImage.url}
                  download={selectedImage.file}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all text-center text-sm"
                >
                  ⬇️ Download Image
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage.prompt)
                  }}
                  className="px-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all text-sm"
                >
                  📋 Copy Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
