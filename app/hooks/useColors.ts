'use client'

import { useState, useEffect } from 'react'

interface Colors {
  window: {
    background: string
    headerBackground: string
    headerText: string
    text: string
    border: string
  }
  navigation: {
    text: string
    hover: string
    background: string
  }
  hoverLabels: {
    text: string
    background: string
    border: string
  }
  bio: {
    background: string
    text: string
  }
  general: {
    background: string
    text: string
  }
}

const defaultColors: Colors = {
  window: {
    background: '#bec4ed',
    headerBackground: '#bec4ed',
    headerText: '#000000',
    text: '#000000',
    border: 'rgba(0,0,0,0.2)',
  },
  navigation: {
    text: '#ffffff',
    hover: '#9ca3af',
    background: '#000000',
  },
  hoverLabels: {
    text: '#000000',
    background: 'transparent',
    border: '#000000',
  },
  bio: {
    background: 'linear-gradient(to bottom, #fef9c3 0%, #fef08a 100%)',
    text: '#000000',
  },
  general: {
    background: '#ffffff',
    text: '#000000',
  },
}

export function useColors() {
  const [colors, setColors] = useState<Colors>(defaultColors)

  // Load colors from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('websiteColors')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColors({ ...defaultColors, ...parsed })
      } catch (e) {
        console.error('Failed to load saved colors', e)
      }
    }
  }, [])

  // Save colors to localStorage
  const saveColors = (newColors: Colors) => {
    setColors(newColors)
    localStorage.setItem('websiteColors', JSON.stringify(newColors))
    console.log('✅ Colors saved!', newColors)
  }

  // Update a specific color
  const updateColor = (
    category: keyof Colors,
    key: string,
    value: string
  ) => {
    const newColors = {
      ...colors,
      [category]: {
        ...colors[category],
        [key]: value,
      },
    }
    saveColors(newColors)
  }

  return {
    colors,
    updateColor,
    saveColors,
  }
}

