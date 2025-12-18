'use client'

import { useState, useEffect } from 'react'

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

const defaultTitles: Titles = {
  navigation: {
    bio: 'Bio',
    signup: 'Sign Up',
    resume: 'Resume',
    music: 'Music',
    store: 'Store',
  },
  hoverLabels: {
    bio: 'Bio',
    signup: 'Sign Up',
    resume: 'Resume',
    music: 'Music',
    store: 'Store',
  },
  windowTitles: {
    bio: '',
    signup: 'SIGN UP',
    resume: 'RESUME',
    music: 'MUSIC',
    store: 'STORE',
  },
}

export function useTitles() {
  const [titles, setTitles] = useState<Titles>(defaultTitles)

  // Load titles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('websiteTitles')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure resume and music are always spelled correctly
        if (parsed.windowTitles?.resume) {
          parsed.windowTitles.resume = 'RESUME'
        }
        if (parsed.windowTitles?.music) {
          parsed.windowTitles.music = 'MUSIC'
        }
        setTitles({ ...defaultTitles, ...parsed })
      } catch (e) {
        console.error('Failed to load saved titles', e)
        setTitles(defaultTitles)
      }
    }
  }, [])

  // Save titles to localStorage
  const saveTitles = (newTitles: Titles) => {
    setTitles(newTitles)
    localStorage.setItem('websiteTitles', JSON.stringify(newTitles))
    console.log('✅ Titles saved!', newTitles)
  }

  // Update a specific title
  const updateTitle = (
    category: keyof Titles,
    key: string,
    value: string
  ) => {
    const newTitles = {
      ...titles,
      [category]: {
        ...titles[category],
        [key]: value,
      },
    }
    saveTitles(newTitles)
  }

  return {
    titles,
    updateTitle,
    saveTitles,
  }
}

