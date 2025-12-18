'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTitles } from '../hooks/useTitles'
import { useColors } from '../hooks/useColors'
import EditableText from './EditableText'
import ColorPicker from './ColorPicker'

interface DraggableWindowProps {
  id: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  windowType?: 'default' | 'sticky' // For Bio sticky note style
  zIndex?: number
  onFocus?: () => void
  colors?: ReturnType<typeof useColors>['colors']
}

export default function DraggableWindow({ 
  id, 
  isOpen, 
  onClose, 
  children, 
  title,
  initialPosition,
  initialSize,
  windowType = 'default',
  zIndex = 50,
  onFocus,
  colors: colorsProp
}: DraggableWindowProps) {
  const { updateTitle } = useTitles()
  const { colors: defaultColors, updateColor } = useColors()
  const colors = colorsProp || defaultColors
  
  // Initialize position from localStorage first, then fall back to initialPosition
  const getInitialPosition = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`window-${id}-position`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed
        } catch (e) {
          console.error('Failed to load window position', e)
        }
      }
    }
    return initialPosition || { x: 100, y: 100 }
  }
  
  const [position, setPosition] = useState(getInitialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const hasLoadedPosition = useRef(false)
  const positionRef = useRef(position)
  
  // Keep ref in sync with position state
  useEffect(() => {
    positionRef.current = position
  }, [position])
  
  // Check edit mode from localStorage
  useEffect(() => {
    const checkEditMode = () => {
      const editModeActive = localStorage.getItem('editModeActive') === 'true'
      setEditMode(editModeActive)
    }
    checkEditMode()
    const interval = setInterval(checkEditMode, 100)
    return () => clearInterval(interval)
  }, [])

  // Load saved position from localStorage on mount and when window opens
  useEffect(() => {
    if (isOpen && !hasLoadedPosition.current) {
      const saved = localStorage.getItem(`window-${id}-position`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPosition(parsed)
          hasLoadedPosition.current = true
        } catch (e) {
          console.error('Failed to load window position', e)
        }
      } else {
        hasLoadedPosition.current = true
      }
    }
  }, [isOpen, id])
  
  // Reset the flag when window closes
  useEffect(() => {
    if (!isOpen) {
      hasLoadedPosition.current = false
    }
  }, [isOpen])

  // Save position to localStorage
  const savePosition = (pos: { x: number; y: number }) => {
    localStorage.setItem(`window-${id}-position`, JSON.stringify(pos))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on inputs, buttons, or editable elements
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('input, textarea, select, button, [contenteditable]')) {
      return
    }
    
    // Bring window to front when clicked
    if (onFocus) {
      onFocus()
    }
    
    // Only start dragging if clicking on the header area
    if (windowRef.current && (e.target as HTMLElement).closest('[data-drag-handle]')) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Constrain to viewport
      const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0)
      const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0)
      
      const constrainedX = Math.max(0, Math.min(maxX, newX))
      const constrainedY = Math.max(0, Math.min(maxY, newY))
      
      const newPosition = { x: constrainedX, y: constrainedY }
      setPosition(newPosition)
      savePosition(newPosition)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      // Ensure position is saved when drag ends (use ref to get latest position)
      savePosition(positionRef.current)
    }
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  if (windowType === 'sticky') {
    // iOS Notes app style (for Bio) - Yellow lined paper
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={windowRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          className="fixed"
          style={{
            left: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : `${position.x}px`,
            top: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : `${position.y}px`,
            maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : '450px',
            width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : (initialSize?.width || '400px'),
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : 'auto',
            zIndex: zIndex,
          }}
          >
            {/* iOS Notes App Style */}
            <div 
              className="relative cursor-move overflow-hidden"
              data-drag-handle
              style={{
                borderRadius: '0',
                background: '#fef9c3',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: 'none',
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Dark header bar - iOS Notes style */}
              <div
                className="relative px-4 py-3 flex items-center justify-between"
                style={{
                  background: '#1c1c1e',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Back button (Notes) */}
                <button
                  className="px-3 py-1.5 rounded text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                  }}
                >
                  Notes
                </button>
                
                {/* Title in center */}
                {title && (
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <EditableText
                      value={title || ''}
                      onChange={(newValue) => {
                        if (updateTitle) {
                          updateTitle('windowTitles', id, newValue)
                        }
                      }}
                      isEditing={editMode}
                      className="text-sm font-semibold"
                      style={{ 
                        fontFamily: 'var(--font-window-title), cursive', 
                        color: '#ffffff',
                      }}
                    />
                  </div>
                )}
                
                {/* Action buttons on right */}
                <div className="flex items-center gap-3">
                  <button className="text-white hover:opacity-70 transition-opacity" aria-label="Share">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </button>
                  <button className="text-white hover:opacity-70 transition-opacity" aria-label="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <button className="text-white hover:opacity-70 transition-opacity" aria-label="Add">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button
                    onClick={onClose}
                    className="text-white hover:opacity-70 transition-opacity ml-2"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Yellow lined paper content area */}
              <div 
                className="relative p-4 md:p-6"
                style={{
                  background: '#fef9c3',
                  minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 60px)' : '300px',
                  position: 'relative',
                }}
              >
                {/* Red margin line on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background: '#d32f2f',
                    left: '32px',
                  }}
                />
                
                {/* Lined paper effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.1) 31px, rgba(0,0,0,0.1) 32px)',
                    backgroundPosition: '0 48px',
                    paddingLeft: '48px',
                  }}
                />

                {/* Date/time stamp */}
                <div
                  className="absolute top-6 right-6 text-xs"
                  style={{
                    color: '#8b4513',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>

                {/* Content with left padding for margin */}
                <div 
                  className="relative z-10"
                  style={{
                    paddingLeft: '48px',
                    paddingTop: '32px',
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // 90s PC Window style (Windows 95/98)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={windowRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed"
          style={{
            left: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : `${position.x}px`,
            top: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : `${position.y}px`,
            width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : (initialSize?.width || '600px'),
            maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : '90vw',
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : '80vh',
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : 'auto',
            fontFamily: 'MS Sans Serif, sans-serif',
            zIndex: zIndex,
          }}
          onClick={(e) => {
            // Only bring to front if clicking on the window itself, not on inputs/buttons
            const target = e.target as HTMLElement
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT' && target.tagName !== 'BUTTON' && !target.closest('input, textarea, select, button')) {
              if (onFocus) {
                onFocus()
              }
            }
          }}
        >
          {/* Window border - 90s beveled edge effect */}
          <div
            className="relative"
            style={{
              border: '2px solid',
              borderTopColor: '#ffffff',
              borderLeftColor: '#ffffff',
              borderRightColor: '#808080',
              borderBottomColor: '#808080',
              boxShadow: 'inset -1px -1px 0 #000000, inset 1px 1px 0 #c0c0c0, 0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header - draggable area with 90s style */}
            <div
              data-drag-handle
              className="flex items-center justify-between cursor-move px-3 py-2 relative"
              style={{
                background: colors.window.headerBackground,
                color: colors.window.headerText,
                fontSize: '12px',
                fontWeight: 'bold',
                minHeight: '24px',
                borderBottom: `1px solid ${colors.window.border}`,
              }}
              onMouseDown={handleMouseDown}
            >
              {editMode && updateColor && (
                <div className="absolute -top-32 left-0 bg-black border border-white/20 p-2 rounded shadow-lg z-[100] flex flex-col gap-2 min-w-[200px]">
                  <ColorPicker
                    label="Header BG"
                    value={colors?.window?.headerBackground || '#000000'}
                    onChange={(value) => {
                      if (updateColor) {
                        updateColor('window', 'headerBackground', value)
                      }
                    }}
                  />
                  <ColorPicker
                    label="Header Text"
                    value={colors?.window?.headerText || '#ffffff'}
                    onChange={(value) => {
                      if (updateColor) {
                        updateColor('window', 'headerText', value)
                      }
                    }}
                  />
                </div>
              )}
              {title && (
                <EditableText
                  value={title || ''}
                  onChange={(newValue) => {
                    if (updateTitle) {
                      updateTitle('windowTitles', id, newValue)
                    }
                  }}
                  isEditing={editMode}
                  className="uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-window-title), cursive', letterSpacing: '0.05em', color: colors?.window?.headerText || '#000000' }}
                />
              )}
              <button
                onClick={onClose}
                className="ml-4 cursor-pointer flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{
                  width: '18px',
                  height: '18px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 'normal',
                  color: colors.window.headerText,
                  lineHeight: '1',
                }}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {/* Content area - black background matching Kim Petras */}
            <div 
              className="overflow-y-auto relative"
              style={{
                maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 24px)' : 'calc(80vh - 24px)',
                background: colors.window.background,
              }}
              onClick={(e) => {
                // Bring to front when clicking on content area (but not on inputs)
                const target = e.target as HTMLElement
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT' && target.tagName !== 'BUTTON' && !target.closest('input, textarea, select, button')) {
                  if (onFocus) {
                    onFocus()
                  }
                }
              }}
            >
              {editMode && updateColor && (
                <div className="absolute top-2 right-2 bg-black border border-white/20 p-2 rounded shadow-lg z-[100] flex flex-col gap-2 pointer-events-auto min-w-[200px]">
                  <ColorPicker
                    label="Window BG"
                    value={colors?.window?.background || '#000000'}
                    onChange={(value) => {
                      if (updateColor) {
                        updateColor('window', 'background', value)
                      }
                    }}
                  />
                  <ColorPicker
                    label="Text"
                    value={colors?.window?.text || '#ffffff'}
                    onChange={(value) => {
                      if (updateColor) {
                        updateColor('window', 'text', value)
                      }
                    }}
                  />
                </div>
              )}
              <div className="p-4 md:p-6" style={{ color: colors.window.text, fontFamily: 'var(--font-body), serif', fontSize: '14px' }}>
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

