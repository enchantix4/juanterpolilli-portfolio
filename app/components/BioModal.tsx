'use client'

import DraggableWindow from './DraggableWindow'

import { useColors } from '../hooks/useColors'

interface BioModalProps {
  isOpen: boolean
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
  title?: string
  colors?: ReturnType<typeof useColors>['colors']
}

export default function BioModal({ isOpen, onClose, zIndex, onFocus, title, colors: colorsProp }: BioModalProps) {
  const { colors: defaultColors } = useColors()
  const colors = colorsProp || defaultColors
  const bioText = "Hello,\n\nMy name is Alba Rari. I'm an artist, producer, and creative director. I make pop like couture: dramatic, cinematic, and built by hand. I've led global media buying, shaped brand strategy for startups, and directed visuals and PR for fashion labels. I am the moment — and the strategy behind it.\n\nxxx\n\nAlba"

  return (
    <DraggableWindow
      id="bio"
      isOpen={isOpen}
      onClose={onClose}
      windowType="sticky"
      title={title}
      initialPosition={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 50, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 200 }}
      initialSize={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : 350, height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : 400 }}
      zIndex={zIndex}
      onFocus={onFocus}
      colors={colors}
    >
      {/* Bio text - iOS Notes style with Permanent Marker font */}
      <p 
        className="leading-relaxed whitespace-pre-line"
        style={{
          fontFamily: 'var(--font-bio), cursive',
          fontSize: '1rem',
          lineHeight: '1.6',
          letterSpacing: '0.01em',
          color: '#000000',
        }}
      >
        {bioText}
      </p>
    </DraggableWindow>
  )
}

