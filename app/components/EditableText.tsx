'use client'

import { useState, useEffect, useRef } from 'react'

interface EditableTextProps {
  value: string
  onChange: (newValue: string) => void
  isEditing: boolean
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  onBlur?: () => void
}

export default function EditableText({
  value,
  onChange,
  isEditing,
  className = '',
  style,
  placeholder = 'Enter text...',
  onBlur
}: EditableTextProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && isFocused && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing, isFocused])

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value)
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          if (onBlur) onBlur()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
          e.stopPropagation()
        }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-transparent border-2 border-blue-500 px-2 py-1 rounded ${className}`}
        style={style}
        placeholder={placeholder}
      />
    )
  }

  return <span className={className} style={style}>{value || ''}</span>
}

