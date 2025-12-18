'use client'

import DraggableWindow from './DraggableWindow'

import { useColors } from '../hooks/useColors'

interface StoreModalProps {
  isOpen: boolean
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
  title?: string
  colors?: ReturnType<typeof useColors>['colors']
}

export default function StoreModal({ isOpen, onClose, zIndex, onFocus, title = 'STORE', colors: colorsProp }: StoreModalProps) {
  const { colors: defaultColors } = useColors()
  const colors = colorsProp || defaultColors
  
  return (
    <DraggableWindow
      id="store"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialPosition={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 300, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 200 }}
      initialSize={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : 500, height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : 400 }}
      zIndex={zIndex}
      onFocus={onFocus}
      colors={colors}
    >
      <div className="space-y-8">
        <h3 className="text-base md:text-lg font-bold mb-4 uppercase tracking-tight" style={{ color: colors.window.text }}>Merch</h3>
        <div className="text-center py-8">
          <p className="text-base md:text-lg font-bold mb-3 uppercase tracking-tight" style={{ color: colors.window.text }}>Coming Soon</p>
          <p className="text-sm leading-relaxed" style={{ color: colors.window.text, opacity: 0.7 }}>
            Merchandise will be available soon. Check back for updates!
          </p>
        </div>
      </div>
    </DraggableWindow>
  )
}

