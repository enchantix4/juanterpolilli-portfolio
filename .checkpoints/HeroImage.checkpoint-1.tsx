'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

import { useColors } from '../hooks/useColors'
import EditableText from './EditableText'
import ColorPicker from './ColorPicker'

interface Titles {
  navigation: {
    bio: string
    signup: string
    resume: string
    music: string
    store: string
  }
  hoverLabels: {
    bio: string
    signup: string
    resume: string
    music: string
    store: string
  }
  windowTitles: {
    bio: string
    signup: string
    resume: string
    music: string
    store: string
  }
}

interface HeroImageProps {
  onSectionClick: (section: string) => void
  titles: Titles
  colors?: ReturnType<typeof useColors>['colors']
}

interface Section {
  name: string
  hotspot: { top: string; left?: string; right?: string; width: string; height: string }
  textPosition: { top: string; left?: string; right?: string }
  clickId: string
  lineStart?: { x: string; y: string }
  lineEnd?: { x: string; y: string }
}

export default function HeroImage({ onSectionClick, titles, colors: colorsProp }: HeroImageProps) {
  const { colors: defaultColors, updateColor } = useColors()
  const colors = colorsProp || defaultColors
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [dragging, setDragging] = useState<{ type: 'hotspot' | 'text' | 'resize' | 'lineStart' | 'lineEnd'; sectionId?: string; resizeHandle?: 'width' | 'height' | 'corner' } | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; startX: number; startY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const labelRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [imageBounds, setImageBounds] = useState<{ left: number; top: number; width: number; height: number; containerWidth: number; containerHeight: number } | null>(null)

  const [sections, setSections] = useState<Section[]>([
    { 
      name: 'Resume', 
      hotspot: { top: '18%', left: '48%', width: '12%', height: '10%' },
      textPosition: { top: '12%', left: '10%' },
      clickId: 'resume'
    },
    { 
      name: 'Bio', 
      hotspot: { top: '28%', left: '42%', width: '12%', height: '10%' },
      textPosition: { top: '28%', left: '12%' },
      clickId: 'bio'
    },
    { 
      name: 'Sign Up', 
      hotspot: { top: '52%', left: '38%', width: '12%', height: '10%' },
      textPosition: { top: '50%', left: '14%' },
      clickId: 'signup'
    },
    { 
      name: 'Music', 
      hotspot: { top: '42%', right: '44%', width: '12%', height: '10%' },
      textPosition: { top: '38%', right: '18%' },
      clickId: 'music'
    },
    { 
      name: 'Store', 
      hotspot: { top: '72%', right: '40%', width: '12%', height: '10%' },
      textPosition: { top: '68%', right: '20%' },
      clickId: 'store'
    },
  ])

  // Load saved positions and titles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('heroImagePositions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSections(prev => prev.map(section => {
          const savedPos = parsed[section.clickId]
          if (savedPos) {
            return {
              ...section,
              hotspot: savedPos.hotspot || section.hotspot,
              textPosition: savedPos.textPosition || section.textPosition,
              lineStart: savedPos.lineStart,
              lineEnd: savedPos.lineEnd
            }
          }
          return section
        }))
        
        // Load saved image position, but it won't animate due to transition: 'none'
        // Image position removed - image is now static
        
      } catch (e) {
        console.error('Failed to load saved positions', e)
      }
    }
    
    const savedTitles = localStorage.getItem('websiteTitles')
    if (savedTitles) {
      try {
        const parsed = JSON.parse(savedTitles)
        setSections(prev => prev.map(section => ({
          ...section,
          name: parsed.hoverLabels?.[section.clickId] || section.name
        })))
      } catch (e) {
        console.error('Failed to load saved titles', e)
      }
    }
  }, [])
  
  useEffect(() => {
    setSections(prev => prev.map(section => ({
      ...section,
      name: titles.hoverLabels[section.clickId as keyof typeof titles.hoverLabels] || section.name
    })))
  }, [titles.hoverLabels])

  // Calculate actual image bounds for responsive positioning
  const calculateImageBounds = () => {
    if (!imageContainerRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Find the actual img element within the Next.js Image component
    const imgElement = imageContainerRef.current.querySelector('img') as HTMLImageElement
    if (!imgElement) {
      // Retry after a short delay if image hasn't loaded yet
      setTimeout(calculateImageBounds, 100)
      return
    }

    const imgRect = imgElement.getBoundingClientRect()
    
    // Calculate where the image actually is relative to the main container (as percentages)
    const imageLeft = ((imgRect.left - containerRect.left) / containerRect.width) * 100
    const imageTop = ((imgRect.top - containerRect.top) / containerRect.height) * 100
    const imageWidth = (imgRect.width / containerRect.width) * 100
    const imageHeight = (imgRect.height / containerRect.height) * 100

    setImageBounds({
      left: imageLeft,
      top: imageTop,
      width: imageWidth,
      height: imageHeight,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
    })
  }

  // Recalculate on mount and window resize
  useEffect(() => {
    // Initial calculation after component mounts
    const initialTimeout = setTimeout(calculateImageBounds, 100)
    
    const handleResize = () => {
      // Small delay to ensure image has rendered after resize
      setTimeout(calculateImageBounds, 100)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Use ResizeObserver for better performance (watches container size changes)
    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(calculateImageBounds, 50)
      })
      resizeObserver.observe(containerRef.current)
    }
    
    // Also recalculate when image loads
    const checkImage = () => {
      const imgElement = imageContainerRef.current?.querySelector('img')
      if (imgElement) {
        if (imgElement.complete) {
          calculateImageBounds()
        } else {
          imgElement.addEventListener('load', calculateImageBounds, { once: true })
        }
      } else {
        // Retry if image element not found yet
        setTimeout(checkImage, 100)
      }
    }
    checkImage()
    
    return () => {
      clearTimeout(initialTimeout)
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Convert hotspot percentage (relative to main container) to position relative to actual image
  // Hotspots are stored as percentages of main container, but need to align with actual image
  const getHotspotPosition = (hotspot: { top: string; left?: string; right?: string; width: string; height: string }) => {
    if (!imageBounds) {
      // Fallback to original percentage positioning if bounds not calculated yet
      return {
        top: hotspot.top,
        left: hotspot.left || undefined,
        right: hotspot.right || undefined,
        width: hotspot.width,
        height: hotspot.height,
      }
    }

    // Hotspot percentages are stored relative to main container
    // Convert them to be relative to the actual image bounds
    const hotspotTopPercent = parseFloat(hotspot.top.replace('%', ''))
    const hotspotLeftPercent = hotspot.left ? parseFloat(hotspot.left.replace('%', '')) : null
    const hotspotRightPercent = hotspot.right ? parseFloat(hotspot.right.replace('%', '')) : null
    const hotspotWidthPercent = parseFloat(hotspot.width.replace('%', ''))
    const hotspotHeightPercent = parseFloat(hotspot.height.replace('%', ''))

    // Calculate hotspot position as percentage within the image bounds
    // Then convert back to main container percentage for CSS
    const imageRelativeTop = Math.max(0, Math.min(100, ((hotspotTopPercent - imageBounds.top) / imageBounds.height) * 100))
    const imageRelativeHeight = Math.max(0, Math.min(100, (hotspotHeightPercent / imageBounds.height) * 100))
    
    let imageRelativeLeft: number
    let imageRelativeWidth: number
    
    if (hotspotLeftPercent !== null) {
      imageRelativeLeft = Math.max(0, Math.min(100, ((hotspotLeftPercent - imageBounds.left) / imageBounds.width) * 100))
      imageRelativeWidth = Math.max(0, Math.min(100, (hotspotWidthPercent / imageBounds.width) * 100))
    } else {
      const calculatedLeft = 100 - (hotspotRightPercent || 0) - hotspotWidthPercent
      imageRelativeLeft = Math.max(0, Math.min(100, ((calculatedLeft - imageBounds.left) / imageBounds.width) * 100))
      imageRelativeWidth = Math.max(0, Math.min(100, (hotspotWidthPercent / imageBounds.width) * 100))
    }

    // Convert back to main container percentages for CSS positioning
    const finalTop = imageBounds.top + (imageRelativeTop * imageBounds.height / 100)
    const finalHeight = imageRelativeHeight * imageBounds.height / 100
    const finalLeft = imageBounds.left + (imageRelativeLeft * imageBounds.width / 100)
    const finalWidth = imageRelativeWidth * imageBounds.width / 100

    return {
      top: `${Math.max(0, Math.min(100, finalTop))}%`,
      left: `${Math.max(0, Math.min(100, finalLeft))}%`,
      width: `${Math.max(0, Math.min(100, finalWidth))}%`,
      height: `${Math.max(0, Math.min(100, finalHeight))}%`,
    }
  }

  const savePositions = () => {
    const toSave: any = {}
  
    sections.forEach(section => {
      toSave[section.clickId] = {
        hotspot: section.hotspot,
        textPosition: section.textPosition,
        lineStart: section.lineStart,
        lineEnd: section.lineEnd
      }
    })
  
    localStorage.setItem('heroImagePositions', JSON.stringify(toSave))
  }

  const getLinePoints = (section: Section) => {
    if (section.lineStart && section.lineEnd) {
      return {
        startX: parseFloat(section.lineStart.x.replace('%', '')),
        startY: parseFloat(section.lineStart.y.replace('%', '')),
        endX: parseFloat(section.lineEnd.x.replace('%', '')),
        endY: parseFloat(section.lineEnd.y.replace('%', ''))
      }
    }
    
    const hotspotLeft = section.hotspot.left 
      ? parseFloat(section.hotspot.left.replace('%', ''))
      : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')) - parseFloat(section.hotspot.width.replace('%', '')))
    const hotspotTop = parseFloat(section.hotspot.top.replace('%', ''))
    const hotspotWidth = parseFloat(section.hotspot.width.replace('%', ''))
    const hotspotHeight = parseFloat(section.hotspot.height.replace('%', ''))
    
    const squareCenterX = hotspotLeft + hotspotWidth / 2
    const squareTop = hotspotTop
    const squareBottom = hotspotTop + hotspotHeight
    
    const textX = section.textPosition.left 
      ? parseFloat(section.textPosition.left)
      : (100 - parseFloat(section.textPosition.right || '0'))
    const textY = parseFloat(section.textPosition.top)
    
    const labelEl = labelRefs.current[section.name]
    let textEdgeX = textX
    if (labelEl && containerRef.current) {
      const labelRect = labelEl.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      const textLeft = ((labelRect.left - containerRect.left) / containerRect.width) * 100
      const textRight = ((labelRect.right - containerRect.left) / containerRect.width) * 100
      const textCenterX = (textLeft + textRight) / 2
      textEdgeX = (textCenterX < squareCenterX) ? textRight : textLeft
    }
    
    const distToTop = Math.abs(textY - squareTop)
    const distToBottom = Math.abs(textY - squareBottom)
    
    const lineStartX = squareCenterX
    const lineStartY = distToTop <= distToBottom ? squareTop : squareBottom
    
    return {
      startX: lineStartX,
      startY: lineStartY,
      endX: textEdgeX,
      endY: textY
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    if (editMode && dragging) {
      // Image dragging removed - image is now static
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setSections(prev => prev.map(section => {
        if (section.clickId === dragging.sectionId) {
          if (dragging.type === 'hotspot') {
            const currentLeft = section.hotspot.left
            const currentRight = section.hotspot.right
            const useLeft = currentLeft !== undefined || (currentRight === undefined && x < 50)
            
            return {
              ...section,
              hotspot: {
                ...section.hotspot,
                top: `${Math.max(0, Math.min(100, y))}%`,
                ...(useLeft ? { left: `${Math.max(0, Math.min(100, x))}%`, right: undefined } : { right: `${Math.max(0, Math.min(100, 100 - x))}%`, left: undefined })
              }
            }
          } else if (dragging.type === 'text') {
            const currentLeft = section.textPosition.left
            const currentRight = section.textPosition.right
            const useLeft = currentLeft !== undefined || (currentRight === undefined && x < 50)
            
            return {
              ...section,
              textPosition: {
                top: `${Math.max(0, Math.min(100, y))}%`,
                ...(useLeft ? { left: `${Math.max(0, Math.min(100, x))}%`, right: undefined } : { right: `${Math.max(0, Math.min(100, 100 - x))}%`, left: undefined })
              }
            }
          } else if (dragging.type === 'resize') {
            const currentLeft = section.hotspot.left ? parseFloat(section.hotspot.left.replace('%', '')) : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')))
            const currentTop = parseFloat(section.hotspot.top.replace('%', ''))
            const currentWidth = parseFloat(section.hotspot.width.replace('%', ''))
            const currentHeight = parseFloat(section.hotspot.height.replace('%', ''))
            
            if (dragging.resizeHandle === 'width') {
              const newWidth = Math.max(2, Math.min(30, Math.abs(x - currentLeft)))
              return {
                ...section,
                hotspot: {
                  ...section.hotspot,
                  width: `${newWidth}%`
                }
              }
            } else if (dragging.resizeHandle === 'height') {
              const newHeight = Math.max(2, Math.min(30, Math.abs(y - currentTop)))
              return {
                ...section,
                hotspot: {
                  ...section.hotspot,
                  height: `${newHeight}%`
                }
              }
            } else if (dragging.resizeHandle === 'corner') {
              const newWidth = Math.max(2, Math.min(30, Math.abs(x - currentLeft)))
              const newHeight = Math.max(2, Math.min(30, Math.abs(y - currentTop)))
              return {
                ...section,
                hotspot: {
                  ...section.hotspot,
                  width: `${newWidth}%`,
                  height: `${newHeight}%`
                }
              }
            }
          } else if (dragging.type === 'lineStart') {
            return {
              ...section,
              lineStart: {
                x: `${Math.max(0, Math.min(100, x))}%`,
                y: `${Math.max(0, Math.min(100, y))}%`
              }
            }
          } else if (dragging.type === 'lineEnd') {
            return {
              ...section,
              lineEnd: {
                x: `${Math.max(0, Math.min(100, x))}%`,
                y: `${Math.max(0, Math.min(100, y))}%`
              }
            }
          }
        }
        return section
      }))
      return
    }
    
    if (!editMode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      let hoveredSection: string | null = null
      
      sections.forEach((section) => {
        // Use calculated position that accounts for actual image bounds
        const hotspotPos = getHotspotPosition(section.hotspot)
        const hotspotLeft = parseFloat(hotspotPos.left?.replace('%', '') || '0')
        const hotspotTop = parseFloat(hotspotPos.top.replace('%', ''))
        const hotspotWidth = parseFloat(hotspotPos.width?.replace('%', '') || '0')
        const hotspotHeight = parseFloat(hotspotPos.height?.replace('%', '') || '0')
        const hotspotRight = hotspotLeft + hotspotWidth
        const hotspotBottom = hotspotTop + hotspotHeight
        
        const isInHotspot = x >= hotspotLeft && 
                           x <= hotspotRight &&
                           y >= hotspotTop && 
                           y <= hotspotBottom
        
        if (isInHotspot) {
          hoveredSection = section.clickId
        }
      })
      
      if (hoveredSection !== activeSection) {
        setActiveSection(hoveredSection)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent, type: 'hotspot' | 'text' | 'resize' | 'lineStart' | 'lineEnd', sectionId?: string, resizeHandle?: 'width' | 'height' | 'corner') => {
    if (editMode) {
      e.preventDefault()
      e.stopPropagation()
      if (sectionId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setDragStart({
          x: 0,
          y: 0,
          startX: x,
          startY: y
        })
        setDragging({ type, sectionId, resizeHandle })
        setSelectedSection(sectionId)
      }
    }
  }

  const handleMouseUp = () => {
    if (dragging) {
      if (dragging.type === 'image') {
        setDragStart(null)
      }
      setDragging(null)
      savePositions()
    }
  }

  const activeSectionData = sections.find(s => s.clickId === activeSection)
  
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden cursor-pointer touch-none"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        zIndex: 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (!editMode) {
          setActiveSection(null)
        }
        if (dragging) {
          setDragging(null)
          savePositions()
        }
      }}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        if (!editMode && sections.length > 0) {
          const touch = e.touches[0]
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = ((touch.clientX - rect.left) / rect.width) * 100
            const y = ((touch.clientY - rect.top) / rect.height) * 100
            
            let touchedSection: string | null = null
            sections.forEach((section) => {
              // Use calculated position that accounts for actual image bounds
              const hotspotPos = getHotspotPosition(section.hotspot)
              const hotspotLeft = parseFloat(hotspotPos.left?.replace('%', '') || '0')
              const hotspotTop = parseFloat(hotspotPos.top.replace('%', ''))
              const hotspotWidth = parseFloat(hotspotPos.width?.replace('%', '') || '0')
              const hotspotHeight = parseFloat(hotspotPos.height?.replace('%', '') || '0')
              const hotspotRight = hotspotLeft + hotspotWidth
              const hotspotBottom = hotspotTop + hotspotHeight
              
              if (x >= hotspotLeft && x <= hotspotRight && y >= hotspotTop && y <= hotspotBottom) {
                touchedSection = section.clickId
              }
            })
            
            if (touchedSection) {
              setActiveSection(touchedSection)
              setTimeout(() => {
                onSectionClick(touchedSection!)
              }, 300)
            }
          }
        }
      }}
    >
      <>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const newEditMode = !editMode
            setEditMode(newEditMode)
            localStorage.setItem('editModeActive', String(newEditMode))
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('storage'))
            setActiveSection(null)
            if (editMode) {
              savePositions()
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          className="fixed top-2 right-2 md:top-4 md:right-4 bg-black text-white px-3 py-2 md:px-4 rounded text-xs md:text-sm font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-lg touch-manipulation min-h-[44px] cursor-pointer"
          style={{ 
            pointerEvents: 'auto',
            zIndex: 9999,
            position: 'fixed',
          }}
        >
          {editMode ? '✕ Exit Edit Mode' : '✏️ Edit Mode'}
        </button>
        {editMode && updateColor && (
          <div className="fixed top-12 right-2 md:top-16 md:right-4 z-[100] bg-black border border-white/20 p-3 md:p-4 rounded shadow-lg flex flex-col gap-2 md:gap-3 max-h-[80vh] overflow-y-auto min-w-[200px] md:min-w-[250px] max-w-[90vw] pointer-events-auto" style={{ pointerEvents: 'auto' }}>
            <h4 className="text-white text-sm font-bold mb-2">General Colors</h4>
            <ColorPicker
              label="Background"
              value={colors?.general?.background || '#ffffff'}
              onChange={(value) => {
                if (updateColor) {
                  updateColor('general', 'background', value)
                }
              }}
            />
          </div>
        )}
      </>

      {/* Hero Image - Static, always visible */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1, pointerEvents: 'none' }}>
        <div 
          ref={imageContainerRef}
          className="relative w-[90%] h-[90%]"
          data-image-container="true"
          style={{
            transform: 'none', // No transform - completely static
            transition: 'none', // No transitions
            pointerEvents: 'none', // Not draggable
            visibility: 'visible',
            opacity: 1,
            display: 'block',
            position: 'relative',
          }}
        >
          <Image
            src="/images/hero.png"
            alt="Alba Rari"
            fill
            className="object-contain"
            priority
            onLoad={calculateImageBounds}
            style={{
              objectPosition: 'center center',
              pointerEvents: 'none',
              visibility: 'visible',
              opacity: 1,
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            draggable={false}
          />
        </div>
      </div>

      {editMode && (
        <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 30 }}>
          <svg 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              width: '100%', 
              height: '100%', 
              zIndex: 15,
            }}
          >
            {sections.map((section) => {
              const linePoints = getLinePoints(section)
              const isSelected = selectedSection === section.clickId
              return (
                <line
                  key={`line-${section.clickId}`}
                  x1={`${linePoints.startX}%`}
                  y1={`${linePoints.startY}%`}
                  x2={`${linePoints.endX}%`}
                  y2={`${linePoints.endY}%`}
                  stroke={isSelected ? "#3b82f6" : (colors?.hoverLabels?.border || '#000000')}
                  strokeWidth={isSelected ? "3" : "2"}
                  opacity={isSelected ? "1" : "0.8"}
                />
              )
            })}
          </svg>

          {sections.map((section) => {
            const linePoints = getLinePoints(section)
            const isSelected = selectedSection === section.clickId
            const isDraggingStart = dragging?.sectionId === section.clickId && dragging?.type === 'lineStart'
            const isDraggingEnd = dragging?.sectionId === section.clickId && dragging?.type === 'lineEnd'
            const startX = linePoints.startX
            const startY = linePoints.startY
            const endX = linePoints.endX
            const endY = linePoints.endY
            return (
              <div key={`line-controls-${section.clickId}`}>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleMouseDown(e, 'lineStart', section.clickId)
                    setSelectedSection(section.clickId)
                  }}
                  className="absolute cursor-move z-30"
                  style={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: isDraggingStart ? '16px' : '14px',
                    height: isDraggingStart ? '16px' : '14px',
                    backgroundColor: isSelected ? '#3b82f6' : '#000',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    position: 'absolute',
                    pointerEvents: 'auto',
                  }}
                  title="Drag to move line start point"
                />
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleMouseDown(e, 'lineEnd', section.clickId)
                    setSelectedSection(section.clickId)
                  }}
                  className="absolute cursor-move z-30"
                  style={{
                    left: `${endX}%`,
                    top: `${endY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: isDraggingEnd ? '16px' : '14px',
                    height: isDraggingEnd ? '16px' : '14px',
                    backgroundColor: isSelected ? '#3b82f6' : '#000',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    position: 'absolute',
                    pointerEvents: 'auto',
                  }}
                  title="Drag to move line end point"
                />
                {(isDraggingStart || isDraggingEnd) && (
                  <div className="absolute pointer-events-none z-40 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                    style={{
                      left: `${isDraggingStart ? startX : endX}%`,
                      top: `${(isDraggingStart ? startY : endY) - 3}%`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    {isDraggingStart ? 'Start' : 'End'}: {isDraggingStart ? linePoints.startX.toFixed(1) : linePoints.endX.toFixed(1)}%, {isDraggingStart ? linePoints.startY.toFixed(1) : linePoints.endY.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          })}

          {sections.map((section) => {
            const isDragging = dragging?.sectionId === section.clickId && dragging?.type === 'hotspot'
            const isSelected = selectedSection === section.clickId
            // Use calculated position for display (aligns with actual image)
            const hotspotPos = getHotspotPosition(section.hotspot)
            
            return (
              <div
                key={`hotspot-${section.clickId}`}
                className="absolute"
                style={{
                  top: hotspotPos.top,
                  left: hotspotPos.left,
                  width: hotspotPos.width,
                  height: hotspotPos.height,
                  position: 'absolute',
                  zIndex: 25,
                  pointerEvents: 'auto',
                }}
              >
                {/* Show actual hover box appearance in edit mode */}
                <button
                  onMouseDown={(e) => {
                    handleMouseDown(e, 'hotspot', section.clickId)
                    setSelectedSection(section.clickId)
                  }}
                  className="absolute border-2 transition-opacity duration-200 cursor-move touch-manipulation"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    borderColor: isSelected ? '#3b82f6' : (colors?.hoverLabels?.border || '#000000'),
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    position: 'absolute',
                    pointerEvents: 'auto',
                  }}
                  aria-label={`Edit ${section.name} hotspot`}
                />
                {/* Edit overlay - only show when selected */}
                {isSelected && (
                  <div
                    className={`absolute inset-0 border-2 ${isSelected ? 'border-blue-600' : 'border-blue-500'} ${isSelected ? 'bg-blue-500/30' : 'bg-blue-500/20'} cursor-move hover:bg-blue-500/30 transition-colors`}
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none', // Allow clicks to pass through to button
                    }}
                  />
                )}
                {isDragging && (
                  <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                    {section.name} Hotspot - Dragging...
                  </div>
                )}
                
                {isSelected && (
                  <>
                    {/* Connection points on all 4 sides for line attachment */}
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const hotspotLeft = section.hotspot.left ? parseFloat(section.hotspot.left.replace('%', '')) : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')) - parseFloat(section.hotspot.width.replace('%', '')))
                        const hotspotTop = parseFloat(section.hotspot.top.replace('%', ''))
                        const hotspotWidth = parseFloat(section.hotspot.width.replace('%', ''))
                        const hotspotHeight = parseFloat(section.hotspot.height.replace('%', ''))
                        const centerX = hotspotLeft + hotspotWidth / 2
                        const topY = hotspotTop
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineStart: { x: `${centerX}%`, y: `${topY}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineStart', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute top-0 left-1/2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#10b981',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to top"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const hotspotLeft = section.hotspot.left ? parseFloat(section.hotspot.left.replace('%', '')) : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')) - parseFloat(section.hotspot.width.replace('%', '')))
                        const hotspotTop = parseFloat(section.hotspot.top.replace('%', ''))
                        const hotspotWidth = parseFloat(section.hotspot.width.replace('%', ''))
                        const hotspotHeight = parseFloat(section.hotspot.height.replace('%', ''))
                        const centerX = hotspotLeft + hotspotWidth / 2
                        const bottomY = hotspotTop + hotspotHeight
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineStart: { x: `${centerX}%`, y: `${bottomY}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineStart', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute bottom-0 left-1/2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, 50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#10b981',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to bottom"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const hotspotLeft = section.hotspot.left ? parseFloat(section.hotspot.left.replace('%', '')) : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')) - parseFloat(section.hotspot.width.replace('%', '')))
                        const hotspotTop = parseFloat(section.hotspot.top.replace('%', ''))
                        const hotspotWidth = parseFloat(section.hotspot.width.replace('%', ''))
                        const hotspotHeight = parseFloat(section.hotspot.height.replace('%', ''))
                        const leftX = hotspotLeft
                        const centerY = hotspotTop + hotspotHeight / 2
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineStart: { x: `${leftX}%`, y: `${centerY}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineStart', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute top-1/2 left-0 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#10b981',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to left"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const hotspotLeft = section.hotspot.left ? parseFloat(section.hotspot.left.replace('%', '')) : (100 - parseFloat((section.hotspot.right || '0').replace('%', '')) - parseFloat(section.hotspot.width.replace('%', '')))
                        const hotspotTop = parseFloat(section.hotspot.top.replace('%', ''))
                        const hotspotWidth = parseFloat(section.hotspot.width.replace('%', ''))
                        const hotspotHeight = parseFloat(section.hotspot.height.replace('%', ''))
                        const rightX = hotspotLeft + hotspotWidth
                        const centerY = hotspotTop + hotspotHeight / 2
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineStart: { x: `${rightX}%`, y: `${centerY}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineStart', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute top-1/2 right-0 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#10b981',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to right"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'resize', section.clickId, 'width')}
                      className="absolute top-1/2 -right-1 cursor-ew-resize z-30"
                      style={{
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '20px',
                        backgroundColor: '#3b82f6',
                        border: '2px solid white',
                        borderRadius: '2px',
                        pointerEvents: 'auto',
                      }}
                      title="Drag to resize width"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'resize', section.clickId, 'height')}
                      className="absolute left-1/2 -bottom-1 cursor-ns-resize z-30"
                      style={{
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '2px solid white',
                        borderRadius: '2px',
                        pointerEvents: 'auto',
                      }}
                      title="Drag to resize height"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'resize', section.clickId, 'corner')}
                      className="absolute -bottom-1 -right-1 cursor-nwse-resize z-30"
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#3b82f6',
                        border: '2px solid white',
                        borderRadius: '2px',
                        pointerEvents: 'auto',
                      }}
                      title="Drag to resize both"
                    />
                  </>
                )}
              </div>
            )
          })}

          {sections.map((section) => {
            const isDragging = dragging?.sectionId === section.clickId && dragging?.type === 'text'
            const isSelected = selectedSection === section.clickId
            
            return (
              <div
                key={`text-${section.clickId}`}
                className="absolute"
                style={{
                  top: section.textPosition.top,
                  left: section.textPosition.left,
                  right: section.textPosition.right,
                  position: 'absolute',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  if (!isDragging) {
                    handleMouseDown(e, 'text', section.clickId)
                    setSelectedSection(section.clickId)
                  }
                }}
              >
                {/* Show actual text label appearance - matches normal mode */}
                <span
                  ref={(el) => { labelRefs.current[section.name] = el }}
                  className="absolute font-script whitespace-nowrap"
                  style={{
                    position: 'relative',
                    fontFamily: 'var(--font-script), cursive',
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 4px rgba(255,255,255,0.4)',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: colors?.hoverLabels?.text || '#000000',
                    transform: 'scale(1)',
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                  }}
                >
                  {section.name}
                </span>
                {/* Editable input - only shows when selected and in edit mode */}
                {isSelected && (
                  <EditableText
                    value={section.name}
                    onChange={(newValue) => {
                      setSections(prev => prev.map(s => 
                        s.clickId === section.clickId ? { ...s, name: newValue } : s
                      ))
                    }}
                    isEditing={editMode}
                    className={`absolute inset-0 font-script whitespace-nowrap border-2 border-green-500 bg-green-500/20 px-2 hover:bg-green-500/30 transition-colors cursor-text`}
                    style={{
                      fontFamily: 'var(--font-script), cursive',
                      fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                      textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 4px rgba(255,255,255,0.4)',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      color: colors?.hoverLabels?.text || '#000000',
                      transform: 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                  />
                )}
                {isDragging && (
                  <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {section.name} Text - Dragging...
                  </div>
                )}
                {/* Connection points for text label - allow connecting line to any side */}
                {isSelected && editMode && (
                  <>
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const textX = section.textPosition.left ? parseFloat(section.textPosition.left.replace('%', '')) : (100 - parseFloat(section.textPosition.right || '0'))
                        const textY = parseFloat(section.textPosition.top.replace('%', ''))
                        // Approximate text box dimensions (will be adjusted when dragging)
                        const textWidth = 15 // approximate
                        const textHeight = 5 // approximate
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineEnd: { x: `${textX}%`, y: `${textY}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineEnd', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute -top-2 left-1/2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to top of text"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const textX = section.textPosition.left ? parseFloat(section.textPosition.left.replace('%', '')) : (100 - parseFloat(section.textPosition.right || '0'))
                        const textY = parseFloat(section.textPosition.top.replace('%', ''))
                        const textWidth = 15
                        const textHeight = 5
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineEnd: { x: `${textX}%`, y: `${textY + textHeight}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineEnd', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute -bottom-2 left-1/2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, 50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to bottom of text"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const textX = section.textPosition.left ? parseFloat(section.textPosition.left.replace('%', '')) : (100 - parseFloat(section.textPosition.right || '0'))
                        const textY = parseFloat(section.textPosition.top.replace('%', ''))
                        const textWidth = 15
                        const textHeight = 5
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineEnd: { x: `${textX}%`, y: `${textY + textHeight / 2}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineEnd', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute top-1/2 -left-2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to left of text"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const textX = section.textPosition.left ? parseFloat(section.textPosition.left.replace('%', '')) : (100 - parseFloat(section.textPosition.right || '0'))
                        const textY = parseFloat(section.textPosition.top.replace('%', ''))
                        const textWidth = 15
                        const textHeight = 5
                        setSections(prev => prev.map(s => 
                          s.clickId === section.clickId ? { 
                            ...s, 
                            lineEnd: { x: `${textX + textWidth}%`, y: `${textY + textHeight / 2}%` }
                          } : s
                        ))
                        handleMouseDown(e, 'lineEnd', section.clickId)
                        setSelectedSection(section.clickId)
                      }}
                      className="absolute top-1/2 -right-2 cursor-crosshair z-30"
                      style={{
                        transform: 'translate(50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                      }}
                      title="Click to connect line to right of text"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!editMode && activeSectionData && (
        <>
          {/* Connecting line - render first so it's behind other elements */}
          <svg 
            className="absolute pointer-events-none" 
            style={{ 
              width: '100%', 
              height: '100%', 
              zIndex: 10,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {(() => {
              const linePoints = getLinePoints(activeSectionData)
              return (
                <line
                  x1={`${linePoints.startX}%`}
                  y1={`${linePoints.startY}%`}
                  x2={`${linePoints.endX}%`}
                  y2={`${linePoints.endY}%`}
                  stroke={colors?.hoverLabels?.border || '#000000'}
                  strokeWidth="2"
                  opacity="0.8"
                />
              )
            })()}
          </svg>
          
          {/* Hotspot box - positioned relative to actual image bounds */}
          {(() => {
            const hotspotPos = getHotspotPosition(activeSectionData.hotspot)
            return (
              <button
                onClick={() => onSectionClick(activeSectionData.clickId)}
                onTouchStart={() => onSectionClick(activeSectionData.clickId)}
                className="absolute border-2 transition-opacity duration-200 cursor-pointer touch-manipulation"
                style={{
                  top: hotspotPos.top,
                  left: hotspotPos.left,
                  width: hotspotPos.width,
                  height: hotspotPos.height,
                  zIndex: 15,
                  backgroundColor: 'transparent',
                  borderColor: colors?.hoverLabels?.border || '#000000',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  position: 'absolute',
                  pointerEvents: 'auto',
                }}
                aria-label={`Open ${activeSectionData.name}`}
              />
            )
          })()}
          
          {/* Text label */}
          <button
            ref={(el) => { labelRefs.current[activeSectionData.name] = el }}
            onClick={() => onSectionClick(activeSectionData.clickId)}
            onTouchStart={() => onSectionClick(activeSectionData.clickId)}
            className="absolute font-script hover:opacity-70 active:opacity-50 transition-opacity duration-150 cursor-pointer whitespace-nowrap touch-manipulation"
            style={{
              top: activeSectionData.textPosition.top,
              left: activeSectionData.textPosition.left,
              right: activeSectionData.textPosition.right,
              position: 'absolute',
              fontFamily: 'var(--font-script), cursive',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 4px rgba(255,255,255,0.4)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: colors?.hoverLabels?.text || '#000000',
              transform: 'scale(1)',
              transformOrigin: 'center center',
              pointerEvents: 'auto',
              zIndex: 15,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {activeSectionData.name}
          </button>
        </>
      )}

      {/* Logo at top center */}
      <div className="absolute top-4 md:top-6 lg:top-8 left-1/2 transform -translate-x-1/2 z-20">
        <Image
          src="/images/logo.png"
          alt="Alba Rari Logo"
          width={100}
          height={100}
          className="object-contain opacity-90 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
        />
      </div>
    </div>
  )
}
