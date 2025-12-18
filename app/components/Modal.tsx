'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.97)' }}
          />
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black max-w-6xl w-full my-auto" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              {/* Close button - matching Kim Petras style */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-400 transition-colors text-sm font-medium uppercase tracking-wider z-20 px-3 py-2"
                aria-label="Close"
              >
                Close
              </button>
              {/* Title */}
              {title && (
                <div className="sticky top-0 bg-black z-10 border-b border-white/20 px-6 md:px-8 py-4 md:py-6">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
                    {title}
                  </h2>
                </div>
              )}
              {/* Content */}
              <div className="px-6 md:px-8 py-6 md:py-8">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

