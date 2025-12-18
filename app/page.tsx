'use client'

import { useState } from 'react'
import HeroImage from './components/HeroImage'
import Navigation from './components/Navigation'
import BioModal from './components/BioModal'
import SignUpModal from './components/SignUpModal'
import ResumeModal from './components/ResumeModal'
import MusicModal from './components/MusicModal'
import StoreModal from './components/StoreModal'
import LinkFolderModal from './components/LinkFolderModal'
import SocialLinks from './components/SocialLinks'
import { useTitles } from './hooks/useTitles'
import { useColors } from './hooks/useColors'

interface LinkFolderContent {
  type: 'url' | 'folder'
  url?: string
  folderPath?: string
}

export default function Home() {
  const { titles } = useTitles()
  const { colors } = useColors()
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set())
  const [windowZIndex, setWindowZIndex] = useState<{ [key: string]: number }>({})
  const [maxZIndex, setMaxZIndex] = useState(50)
  const [linkFolderModals, setLinkFolderModals] = useState<Map<string, LinkFolderContent>>(new Map())

  const handleSectionClick = (section: string) => {
    setOpenWindows(prev => {
      const newSet = new Set(prev)
      newSet.add(section)
      return newSet
    })
    // Bring window to front when opened
    bringToFront(section)
  }

  const bringToFront = (section: string) => {
    const newZIndex = maxZIndex + 1
    setMaxZIndex(newZIndex)
    setWindowZIndex(prev => ({
      ...prev,
      [section]: newZIndex
    }))
  }

  const closeWindow = (section: string) => {
    setOpenWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(section)
      return newSet
    })
    setWindowZIndex(prev => {
      const newObj = { ...prev }
      delete newObj[section]
      return newObj
    })
  }

  const openLinkFolder = (content: LinkFolderContent) => {
    const modalId = `link-folder-${content.type}-${content.url || content.folderPath || Date.now()}`
    setLinkFolderModals(prev => {
      const newMap = new Map(prev)
      newMap.set(modalId, content)
      return newMap
    })
    bringToFront(modalId)
  }

  const closeLinkFolder = (modalId: string) => {
    setLinkFolderModals(prev => {
      const newMap = new Map(prev)
      newMap.delete(modalId)
      return newMap
    })
    setWindowZIndex(prev => {
      const newObj = { ...prev }
      delete newObj[modalId]
      return newObj
    })
  }

  return (
    <main className="overflow-hidden" style={{ 
      backgroundColor: colors.general.background, 
      position: 'relative', 
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      minWidth: '100vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: 0,
      padding: 0,
      zIndex: 0 
    }}>
      <Navigation onSectionClick={handleSectionClick} titles={titles} colors={colors} />
      <HeroImage onSectionClick={handleSectionClick} titles={titles} colors={colors} />
      
      {/* Multiple windows can be open simultaneously */}
      {openWindows.has('bio') && (
        <BioModal 
          isOpen={true} 
          onClose={() => closeWindow('bio')}
          zIndex={windowZIndex['bio'] || 50}
          onFocus={() => bringToFront('bio')}
          title={titles.windowTitles.bio}
          colors={colors}
        />
      )}
      {openWindows.has('signup') && (
        <SignUpModal 
          isOpen={true} 
          onClose={() => closeWindow('signup')}
          zIndex={windowZIndex['signup'] || 50}
          onFocus={() => bringToFront('signup')}
          title={titles.windowTitles.signup}
          colors={colors}
        />
      )}
      {openWindows.has('resume') && (
        <ResumeModal 
          isOpen={true} 
          onClose={() => closeWindow('resume')}
          zIndex={windowZIndex['resume'] || 50}
          onFocus={() => bringToFront('resume')}
          title={titles.windowTitles.resume}
          colors={colors}
          onOpenLink={openLinkFolder}
        />
      )}
      {openWindows.has('music') && (
        <MusicModal 
          isOpen={true} 
          onClose={() => closeWindow('music')}
          zIndex={windowZIndex['music'] || 50}
          onFocus={() => bringToFront('music')}
          title={titles.windowTitles.music}
          colors={colors}
        />
      )}
      {openWindows.has('store') && (
        <StoreModal 
          isOpen={true} 
          onClose={() => closeWindow('store')}
          zIndex={windowZIndex['store'] || 50}
          onFocus={() => bringToFront('store')}
          title={titles.windowTitles.store}
          colors={colors}
        />
      )}

      {/* Link/Folder Modals */}
      {Array.from(linkFolderModals.entries()).map(([modalId, content]) => (
        <LinkFolderModal
          key={modalId}
          isOpen={true}
          onClose={() => closeLinkFolder(modalId)}
          zIndex={windowZIndex[modalId] || 50}
          onFocus={() => bringToFront(modalId)}
          content={content}
          colors={colors}
          onOpenItem={openLinkFolder}
        />
      ))}

      <SocialLinks />
    </main>
  )
}

