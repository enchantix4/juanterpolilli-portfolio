'use client'

import { useState, useEffect, useRef } from 'react'
import DraggableWindow from './DraggableWindow'
import { useColors } from '../hooks/useColors'

interface LinkFolderModalProps {
  isOpen: boolean
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
  title?: string
  colors?: ReturnType<typeof useColors>['colors']
  content: {
    type: 'url' | 'folder'
    url?: string
    folderPath?: string
  }
  onOpenItem?: (item: { type: 'url' | 'folder'; url?: string; folderPath?: string }) => void
}

interface FolderItem {
  name: string
  type: 'file' | 'folder'
  path: string
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif']
const isImageFile = (filename: string): boolean => {
  const lower = filename.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))
}

export default function LinkFolderModal({ 
  isOpen, 
  onClose, 
  zIndex, 
  onFocus, 
  title, 
  colors: colorsProp,
  content,
  onOpenItem
}: LinkFolderModalProps) {
  const { colors: defaultColors } = useColors()
  const colors = colorsProp || defaultColors
  const [folderItems, setFolderItems] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const windowRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const resizeHandlesRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 's' | 'n' | null>(null)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 })
  const [windowRect, setWindowRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (isOpen && content.type === 'folder' && content.folderPath) {
      loadFolderContents(content.folderPath)
    }
  }, [isOpen, content])

  // Update navigation buttons when iframe navigates
  useEffect(() => {
    if (content.type === 'url' && iframeRef.current) {
      const iframe = iframeRef.current
      
      const checkNavigation = () => {
        try {
          // Try to access iframe history (may fail due to cross-origin)
          if (iframe.contentWindow) {
            setCanGoBack(iframe.contentWindow.history.length > 1)
            // Can't reliably check forward, so we'll enable it
            setCanGoForward(true)
          }
        } catch (e) {
          // Cross-origin restrictions - enable buttons anyway
          setCanGoBack(true)
          setCanGoForward(true)
        }
      }

      iframe.addEventListener('load', checkNavigation)
      return () => iframe.removeEventListener('load', checkNavigation)
    }
  }, [content.type, isOpen])

  // Handle resizing
  useEffect(() => {
    if (!isResizing || !resizeHandle || !windowRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!windowRef.current) return

      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      
      let newWidth = resizeStartRef.current.width
      let newHeight = resizeStartRef.current.height
      let newLeft = resizeStartRef.current.left
      let newTop = resizeStartRef.current.top

      // Handle different resize handles
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(400, Math.min(window.innerWidth - newLeft, resizeStartRef.current.width + deltaX))
      }
      if (resizeHandle.includes('w')) {
        const widthChange = resizeStartRef.current.width - deltaX
        if (widthChange >= 400) {
          newWidth = widthChange
          newLeft = resizeStartRef.current.left + deltaX
        }
      }
      if (resizeHandle.includes('s')) {
        // Resize from bottom - increase/decrease height
        const maxHeight = window.innerHeight - newTop
        newHeight = Math.max(300, Math.min(maxHeight, resizeStartRef.current.height + deltaY))
      }
      if (resizeHandle.includes('n')) {
        // Resize from top - adjust both height and position
        const heightChange = resizeStartRef.current.height - deltaY
        if (heightChange >= 300 && newTop + deltaY >= 0) {
          newHeight = heightChange
          newTop = resizeStartRef.current.top + deltaY
        }
      }

      // Apply new size and position
      if (windowRef.current) {
        // Force height to be a fixed pixel value (not 'auto')
        windowRef.current.style.width = `${newWidth}px`
        windowRef.current.style.height = `${newHeight}px`
        windowRef.current.style.left = `${newLeft}px`
        windowRef.current.style.top = `${newTop}px`
        // Remove maxHeight constraint that might interfere
        windowRef.current.style.maxHeight = 'none'
        
        // Find and update the inner content containers
        // The structure is: motion.div > div.relative (border) > div.overflow-y-auto (content area)
        const borderContainer = windowRef.current.querySelector('.relative') as HTMLElement
        const contentArea = windowRef.current.querySelector('.overflow-y-auto.relative') as HTMLElement
        
        if (borderContainer) {
          // Update border container height
          borderContainer.style.height = `${newHeight}px`
        }
        
        if (contentArea) {
          // Calculate content height (subtract header height)
          const headerHeight = windowRef.current.querySelector('[data-drag-handle]')?.getBoundingClientRect().height || 35
          const contentHeight = newHeight - headerHeight
          contentArea.style.height = `${contentHeight}px`
          contentArea.style.maxHeight = `${contentHeight}px`
          contentArea.style.overflow = 'auto'
        }
        
        // Update the iframe height if it exists (for URL previews)
        const iframe = windowRef.current.querySelector('iframe') as HTMLIFrameElement
        if (iframe && contentArea) {
          // Calculate iframe height (content height minus navigation bar)
          const navBar = windowRef.current.querySelector('[style*="background: rgb(158, 255, 31)"]') as HTMLElement
          const navBarHeight = navBar?.getBoundingClientRect().height || 47
          const iframeHeight = contentArea.getBoundingClientRect().height - navBarHeight
          iframe.style.height = `${iframeHeight}px`
        }
        
        // Update resize handles position
        if (resizeHandlesRef.current) {
          resizeHandlesRef.current.style.left = `${newLeft}px`
          resizeHandlesRef.current.style.top = `${newTop}px`
          resizeHandlesRef.current.style.width = `${newWidth}px`
          resizeHandlesRef.current.style.height = `${newHeight}px`
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeHandle])

  const handleResizeStart = (e: React.MouseEvent, handle: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 's' | 'n') => {
    e.preventDefault()
    e.stopPropagation()
    
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      }
      setIsResizing(true)
      setResizeHandle(handle)
    }
  }

  const loadFolderContents = async (folderPath: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/list-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Check if it's a production environment error
        if (response.status === 403 && data.message) {
          setError('Folder browsing is only available in local development. This feature requires access to your local file system.')
        } else {
          setError(data.error || 'Failed to load folder contents')
        }
        setFolderItems([])
      } else {
        setFolderItems(data.items || [])
      }
    } catch (err) {
      setError('Failed to load folder contents')
      setFolderItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: FolderItem) => {
    if (onOpenItem) {
      if (item.type === 'folder') {
        // Open folder in a new modal
        onOpenItem({ type: 'folder', folderPath: item.path })
      } else {
        // For files, try to open them via API
        fetch('/api/open-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: item.path }),
        })
        .then(response => response.json())
        .then(data => {
          if (!data.success && data.error) {
            // Show user-friendly message in production
            console.log('File opening not available:', data.message || data.error)
          }
        })
        .catch(() => {
          // Silently fail - file opening is a local-only feature
        })
      }
    }
  }

  // Get window element after mount by finding the motion.div container
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const findWindowElement = () => {
        // Find the window by looking for the motion.div that contains our content
        let element: HTMLElement | null = contentRef.current
        // Traverse up to find the fixed positioned window container (motion.div)
        while (element && element.parentElement) {
          element = element.parentElement
          const style = window.getComputedStyle(element)
          // Look for fixed position - this is the motion.div from DraggableWindow
          if (style.position === 'fixed') {
            windowRef.current = element as HTMLDivElement
            break
          }
        }
      }
      // Try multiple times to ensure we find it after React renders
      const timeout1 = setTimeout(findWindowElement, 100)
      const timeout2 = setTimeout(findWindowElement, 300)
      const interval = setInterval(findWindowElement, 500)
      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearInterval(interval)
      }
    }
  }, [isOpen, content])

  // Update resize handles position when window moves or resizes
  useEffect(() => {
    if (!isOpen) return

    const updateHandlesPosition = () => {
      if (windowRef.current && resizeHandlesRef.current) {
        const rect = windowRef.current.getBoundingClientRect()
        resizeHandlesRef.current.style.left = `${rect.left}px`
        resizeHandlesRef.current.style.top = `${rect.top}px`
        resizeHandlesRef.current.style.width = `${rect.width}px`
        resizeHandlesRef.current.style.height = `${rect.height}px`
      }
    }

    // Update immediately and then periodically
    updateHandlesPosition()
    const interval = setInterval(updateHandlesPosition, 100)
    return () => clearInterval(interval)
  }, [isOpen, isResizing])

  return (
    <DraggableWindow
      id={`link-folder-${content.type}-${content.url || content.folderPath}`}
      isOpen={isOpen}
      onClose={onClose}
      title={title || (content.type === 'url' ? 'LINK' : 'FOLDER')}
      initialPosition={{ 
        x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 250, 
        y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 200 
      }}
      initialSize={{ 
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : (content.type === 'url' ? 1000 : 700), 
        height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : (content.type === 'url' ? 700 : 600)
      }}
      zIndex={zIndex}
      onFocus={onFocus}
      colors={colors}
    >
      <div ref={contentRef} className="space-y-4 relative" data-link-folder-content style={{ width: '100%', height: '100%', minHeight: '100%' }}>
        {content.type === 'url' && content.url && (
          <div className="h-full flex flex-col" style={{ background: colors.window.background }}>
            {/* Browser Navigation Bar */}
            <div 
              className="flex items-center gap-1 px-2 py-1.5 border-b"
              style={{ 
                background: '#9eff1f',
                borderColor: 'rgba(255,255,255,0.1)'
              }}
            >
              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (iframeRef.current?.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.history.back()
                      } catch (e) {
                        console.error('Cannot navigate back:', e)
                      }
                    }
                  }}
                  disabled={!canGoBack}
                  className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ color: canGoBack ? colors.window.text : 'rgba(255,255,255,0.3)' }}
                  title="Back"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (iframeRef.current?.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.history.forward()
                      } catch (e) {
                        console.error('Cannot navigate forward:', e)
                      }
                    }
                  }}
                  disabled={!canGoForward}
                  className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ color: canGoForward ? colors.window.text : 'rgba(255,255,255,0.3)' }}
                  title="Forward"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (iframeRef.current) {
                      iframeRef.current.src = content.url || ''
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  style={{ color: colors.window.text }}
                  title="Home"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  style={{ color: colors.window.text }}
                  title="Reload"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              </div>

              {/* Address Bar */}
              <div className="flex-1 mx-2">
                <input
                  type="text"
                  value={content.url}
                  readOnly
                  className="w-full px-3 py-2 text-base rounded"
                  style={{ 
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid rgba(0,0,0,0.2)'
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>

              {/* Folder/Open Button */}
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                style={{ color: colors.window.text }}
                title="Open in New Tab"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden" style={{ background: '#ffffff' }}>
              <iframe
                ref={iframeRef}
                src={content.url}
                className="w-full h-full"
                style={{ border: 'none' }}
                title="Webpage preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-navigation"
                allow="fullscreen"
              />
            </div>
          </div>
        )}

        {content.type === 'folder' && (
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 uppercase tracking-tight" style={{ color: colors.window.text }}>
              {content.folderPath?.split('/').pop() || 'Folder'}
            </h3>
            
            {loading && (
              <p className="text-sm" style={{ color: colors.window.text, opacity: 0.7 }}>
                Loading...
              </p>
            )}

            {error && (
              <p className="text-sm" style={{ color: '#ff6b6b', opacity: 0.9 }}>
                {error}
              </p>
            )}

            {!loading && !error && folderItems.length === 0 && (
              <p className="text-sm" style={{ color: colors.window.text, opacity: 0.7 }}>
                Folder is empty
              </p>
            )}

            {!loading && !error && folderItems.length > 0 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {folderItems.map((item, index) => {
                  const isImage = item.type === 'file' && isImageFile(item.name)
                  
                  return (
                    <div key={index}>
                      <div
                        onClick={() => handleItemClick(item)}
                        className={`p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5 transition-colors ${isImage ? 'mb-2' : ''}`}
                        style={{ color: colors.window.text }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {item.type === 'folder' ? '📁' : '📄'}
                          </span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                      </div>
                      {isImage && (
                        <div className="mt-2 border border-white/10 rounded overflow-hidden">
                          <img
                            src={item.path.startsWith('portfolio:') 
                              ? `/images/portfolio/${item.path.replace('portfolio:', '').replace(/^\/+/, '')}`
                              : `/api/file-preview?path=${encodeURIComponent(item.path)}`}
                            alt={item.name}
                            className="w-full h-auto max-h-[400px] object-contain"
                            onError={(e) => {
                              // Hide image on error (e.g., in production where file access isn't available)
                              const target = e.target as HTMLImageElement
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = '<p class="p-2 text-xs text-center opacity-70">Image preview not available</p>'
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Resize Handles - positioned relative to window container */}
      {isOpen && (
        <div 
          ref={resizeHandlesRef}
          className="fixed pointer-events-none"
          style={{
            left: windowRef.current ? (windowRef.current.getBoundingClientRect().left + 'px') : '0px',
            top: windowRef.current ? (windowRef.current.getBoundingClientRect().top + 'px') : '0px',
            width: windowRef.current ? (windowRef.current.getBoundingClientRect().width + 'px') : '0px',
            height: windowRef.current ? (windowRef.current.getBoundingClientRect().height + 'px') : '0px',
            zIndex: (zIndex || 50) + 10,
            pointerEvents: 'none'
          }}
        >
          {/* Corner handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize"
          />
          {/* Edge handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize width"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            className="absolute top-0 left-0 w-2 h-full cursor-ew-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize width"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 's')}
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize height"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize pointer-events-auto"
            style={{ background: 'transparent' }}
            title="Resize height"
          />
        </div>
      )}
    </DraggableWindow>
  )
}

