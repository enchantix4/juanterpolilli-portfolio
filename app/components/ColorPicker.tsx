'use client'

import { useState, useEffect, useRef } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function ColorPicker({ label, value = '#000000', onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Ensure value is always a valid color string
  const safeValue = value || '#000000'

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-white whitespace-nowrap">{label}:</label>
        <div
          className="w-8 h-8 border-2 border-white cursor-pointer rounded flex-shrink-0"
          style={{ backgroundColor: safeValue }}
          onClick={() => setIsOpen(!isOpen)}
          title="Click to open color picker"
        />
        <input
          type="text"
          value={safeValue}
          onChange={(e) => {
            const newValue = e.target.value
            if (onChange) {
              onChange(newValue)
            }
          }}
          className="w-24 px-2 py-1 text-xs bg-black border border-white/20 text-white rounded"
          placeholder="#000000"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {isOpen && (
        <div className="absolute top-10 left-0 z-[100] bg-black border border-white/20 p-4 rounded shadow-lg">
          <input
            type="color"
            value={safeValue}
            onChange={(e) => {
              if (onChange) {
                onChange(e.target.value)
              }
            }}
            className="w-full h-32 cursor-pointer mb-2"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={safeValue}
              onChange={(e) => {
                if (onChange) {
                  onChange(e.target.value)
                }
              }}
              className="flex-1 px-2 py-1 text-xs bg-black border border-white/20 text-white rounded"
              placeholder="#000000"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="px-3 py-1 text-xs bg-white text-black rounded hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

