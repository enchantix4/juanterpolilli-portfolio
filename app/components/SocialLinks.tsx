'use client'

export default function SocialLinks() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-30">
      <div className="container mx-auto px-6 md:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs md:text-sm text-gray-400">
            <span>© Juan Terpolilli</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

