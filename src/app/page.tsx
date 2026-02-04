'use client'

import { useState, useEffect } from 'react'

interface ContentSet {
  id: string
  date: string
  caption: string
  slides: string[]
  status: 'pending' | 'approved' | 'posted'
  zipUrl?: string
  theme?: string
}

// 10 content sets based on competitor ad themes
const sampleContent: ContentSet[] = [
  {
    id: 'set1',
    date: '2026-02-04',
    caption: 'Access to treatment isn\'t enough — we want cures. HairDAO is funding real research, not just prescriptions. Science. Community. Progress. 🧬',
    slides: ['/content/set1/slide1.png', '/content/set1/slide2.png', '/content/set1/slide3.png', '/content/set1/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set1/slides.zip',
    theme: 'access'
  },
  {
    id: 'set2',
    date: '2026-02-04',
    caption: 'Convenience is great, but what if we actually solved the problem? Anagen is world-class hair loss research — open to everyone. 🧬',
    slides: ['/content/set2/slide1.png', '/content/set2/slide2.png', '/content/set2/slide3.png', '/content/set2/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set2/slides.zip',
    theme: 'convenience'
  },
  {
    id: 'set3',
    date: '2026-02-04',
    caption: 'Our results belong to everyone — not shareholders. Transparent trials, open data, real progress. That\'s the Anagen difference 🧬',
    slides: ['/content/set3/slide1.png', '/content/set3/slide2.png', '/content/set3/slide3.png', '/content/set3/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set3/slides.zip',
    theme: 'results'
  },
  {
    id: 'set4',
    date: '2026-02-04',
    caption: 'The best time to join real research is now. Anagen — where your participation drives breakthroughs 🧬',
    slides: ['/content/set4/slide1.png', '/content/set4/slide2.png', '/content/set4/slide3.png', '/content/set4/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set4/slides.zip',
    theme: 'early_intervention'
  },
  {
    id: 'set5',
    date: '2026-02-04',
    caption: 'Personalized care meets collective breakthroughs. Anagen combines individual attention with community-powered research 🧬',
    slides: ['/content/set5/slide1.png', '/content/set5/slide2.png', '/content/set5/slide3.png', '/content/set5/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set5/slides.zip',
    theme: 'personalization'
  },
  {
    id: 'set6',
    date: '2026-02-04',
    caption: 'Our science is open for everyone to verify. No gatekeepers, no black boxes — just transparent research 🧬',
    slides: ['/content/set6/slide1.png', '/content/set6/slide2.png', '/content/set6/slide3.png', '/content/set6/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set6/slides.zip',
    theme: 'science'
  },
  {
    id: 'set7',
    date: '2026-02-04',
    caption: 'Confidence comes from real progress, not promises. Join a community actually working toward a cure 🧬',
    slides: ['/content/set7/slide1.png', '/content/set7/slide2.png', '/content/set7/slide3.png', '/content/set7/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set7/slides.zip',
    theme: 'confidence'
  },
  {
    id: 'set8',
    date: '2026-02-04',
    caption: 'We fund cures, not subscriptions. Anagen is research you own — patient-funded, patient-led 🧬',
    slides: ['/content/set8/slide1.png', '/content/set8/slide2.png', '/content/set8/slide3.png', '/content/set8/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set8/slides.zip',
    theme: 'subscription'
  },
  {
    id: 'set9',
    date: '2026-02-04',
    caption: 'Taking control of your health is powerful. Join thousands doing something real about hair loss 🧬',
    slides: ['/content/set9/slide1.png', '/content/set9/slide2.png', '/content/set9/slide3.png', '/content/set9/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set9/slides.zip',
    theme: 'stigma'
  },
  {
    id: 'set10',
    date: '2026-02-04',
    caption: 'The future of medicine is patient-owned. Anagen proves decentralized science works 🧬',
    slides: ['/content/set10/slide1.png', '/content/set10/slide2.png', '/content/set10/slide3.png', '/content/set10/slide4.png'],
    status: 'pending',
    zipUrl: '/content/set10/slides.zip',
    theme: 'future'
  },
]

export default function Dashboard() {
  const [content, setContent] = useState<ContentSet[]>(sampleContent)
  const [selectedSet, setSelectedSet] = useState<ContentSet | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'posted'>('all')

  const filteredContent = content.filter(c => filter === 'all' || c.status === filter)

  const updateStatus = (id: string, status: ContentSet['status']) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    posted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl">
              🧬
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HairDAO Content</h1>
              <p className="text-sm text-white/50">Instagram Pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'approved', 'posted'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: content.length, color: 'purple' },
            { label: 'Pending', value: content.filter(c => c.status === 'pending').length, color: 'yellow' },
            { label: 'Approved', value: content.filter(c => c.status === 'approved').length, color: 'green' },
            { label: 'Posted', value: content.filter(c => c.status === 'posted').length, color: 'blue' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-white/50 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(item => (
            <div
              key={item.id}
              className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedSet(item)}
            >
              {/* Preview Grid */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-black/30">
                {item.slides.slice(0, 4).map((slide, i) => (
                  <img 
                    key={i} 
                    src={slide} 
                    alt={`Slide ${i + 1}`}
                    className="aspect-square object-cover rounded-lg bg-gradient-to-br from-purple-900/50 to-violet-900/50"
                  />
                ))}
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">{item.date}</span>
                    {item.theme && (
                      <span className="text-purple-400/60 text-xs bg-purple-500/10 px-2 py-0.5 rounded">
                        {item.theme}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-white/80 text-sm line-clamp-3">{item.caption}</p>
                
                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {item.status === 'pending' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'approved'); }}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Approve
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'posted'); }}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Mark Posted
                    </button>
                  )}
                  <a
                    href={item.zipUrl}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    ↓
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No content matching filter</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSet && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedSet(null)}
        >
          <div 
            className="bg-[#12121a] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSet.id}</h2>
                <p className="text-white/50 text-sm">{selectedSet.date} • {selectedSet.theme}</p>
              </div>
              <button
                onClick={() => setSelectedSet(null)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60"
              >
                ✕
              </button>
            </div>
            
            {/* Slides Preview */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {selectedSet.slides.map((slide, i) => (
                  <img 
                    key={i} 
                    src={slide} 
                    alt={`Slide ${i + 1}`}
                    className="aspect-[4/5] object-cover rounded-xl bg-gradient-to-br from-purple-900/50 to-violet-900/50"
                  />
                ))}
              </div>
              
              {/* Caption */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-white/40 text-sm mb-2">Caption</p>
                <p className="text-white">{selectedSet.caption}</p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <a 
                  href={selectedSet.zipUrl} 
                  download
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium transition-all text-center"
                >
                  Download All Slides
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSet.caption)
                    alert('Caption copied!')
                  }}
                  className="px-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Copy Caption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
