'use client'

import DraggableWindow from './DraggableWindow'
import Image from 'next/image'

import { useColors } from '../hooks/useColors'

interface MusicModalProps {
  isOpen: boolean
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
  title?: string
  colors?: ReturnType<typeof useColors>['colors']
}

export default function MusicModal({ isOpen, onClose, zIndex, onFocus, title = 'MUSIC', colors: colorsProp }: MusicModalProps) {
  const { colors: defaultColors } = useColors()
  const colors = colorsProp || defaultColors
  
  return (
    <DraggableWindow
      id="music"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialPosition={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (typeof window !== 'undefined' ? window.innerWidth / 2 - 300 : 300), y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 100 }}
      initialSize={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : 600, height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : 500 }}
      zIndex={zIndex}
      onFocus={onFocus}
      colors={colors}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ITCH Album */}
          <div className="group">
            <div className="relative aspect-square mb-4 overflow-hidden">
              <Image
                src="/images/itch-cover.png"
                alt="ITCH Album Cover"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-base font-bold mb-2 uppercase tracking-tight" style={{ color: colors.window.text }}>ITCH</h4>
            <a
              href="https://artists.landr.com/ITCH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm uppercase tracking-wider hover:underline"
              style={{ color: '#4a9eff', textDecoration: 'underline' }}
            >
              stream/download
            </a>
          </div>
        </div>
      </div>
    </DraggableWindow>
  )
}

