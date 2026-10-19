'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/components/ui/AudioProvider'

export default function SettingsPanel() {
  const { bgmEnabled, sfxEnabled, volume, toggleBGM, toggleSFX, setVolume, playSFX, bgmTrackIndex, bgmTracks, playNextBGM, playPrevBGM } = useAudio()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    if (!open) {
      playSFX('/audio/SettingsUI.mp3')
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl bg-surface/80 backdrop-blur border border-zinc-600/40 flex items-center justify-center hover:border-accent/40 transition-colors"
        aria-label="音乐设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-16 right-4 z-50 w-72 card-glass p-5 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-200">音频设置</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">背景音乐</span>
                  <button
                    onClick={toggleBGM}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      bgmEnabled ? 'bg-accent/60' : 'bg-zinc-700'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full absolute top-1"
                      animate={{ left: bgmEnabled ? '1.5rem' : '0.25rem' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {bgmEnabled && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={playPrevBGM}
                      className="w-8 h-8 rounded-lg bg-surface border border-zinc-600/40 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
                      title="上一首"
                    >
                      ⏮
                    </button>
                    <span className="text-xs text-zinc-400 font-mono truncate max-w-[140px]">
                      {bgmTracks[bgmTrackIndex] ? bgmTracks[bgmTrackIndex].replace('/audio/', '').replace('.mp3', '') : '-'}
                    </span>
                    <button
                      onClick={playNextBGM}
                      className="w-8 h-8 rounded-lg bg-surface border border-zinc-600/40 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
                      title="下一首"
                    >
                      ⏭
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">音效</span>
                  <button
                    onClick={toggleSFX}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      sfxEnabled ? 'bg-accent/60' : 'bg-zinc-700'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full absolute top-1"
                      animate={{ left: sfxEnabled ? '1.5rem' : '0.25rem' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">音量</span>
                    <span className="text-xs text-zinc-500 font-mono">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}