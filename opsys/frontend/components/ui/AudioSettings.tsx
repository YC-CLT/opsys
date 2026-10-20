'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/components/ui/AudioProvider'

export default function AudioSettings() {
  const {
    bgmEnabled,
    sfxEnabled,
    volume,
    toggleBGM,
    toggleSFX,
    setVolume,
    bgmTrackIndex,
    bgmTracks,
    playNextBGM,
    playPrevBGM,
  } = useAudio()
  const [open, setOpen] = useState(false)

  const trackName = bgmTracks[bgmTrackIndex]
    ? bgmTracks[bgmTrackIndex].split('/').pop()?.replace('.mp3', '') ?? 'bgm'
    : 'bgm'

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Audio Settings"
        className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-surface border border-accent/20 
                   flex items-center justify-center text-accent hover:bg-accent/10 transition-colors 
                   shadow-lg hover:shadow-accent/20"
        aria-label="音频设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {bgmEnabled || sfxEnabled ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 z-50 w-64 bg-surface border border-accent/20 
                       rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">音频设置</h3>

            {/* BGM Toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400">背景音乐</span>
              <button
                onClick={toggleBGM}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  bgmEnabled ? 'bg-accent' : 'bg-zinc-700'
                }`}
                aria-label="切换背景音乐"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    bgmEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* BGM Track Selector */}
            {bgmEnabled && (
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={playPrevBGM}
                  className="w-6 h-6 rounded bg-surface-hover text-zinc-400 hover:text-foreground flex items-center justify-center text-xs"
                  aria-label="上一首"
                >
                  ⏮
                </button>
                <span className="text-xs text-zinc-500 truncate mx-2" title={trackName}>
                  {trackName}
                </span>
                <button
                  onClick={playNextBGM}
                  className="w-6 h-6 rounded bg-surface-hover text-zinc-400 hover:text-foreground flex items-center justify-center text-xs"
                  aria-label="下一首"
                >
                  ⏭
                </button>
              </div>
            )}

            {/* SFX Toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400">音效</span>
              <button
                onClick={toggleSFX}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  sfxEnabled ? 'bg-accent' : 'bg-zinc-700'
                }`}
                aria-label="切换音效"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 shrink-0">音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-700 cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                           [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:bg-accent"
                aria-label="音量调节"
              />
              <span className="text-xs text-zinc-500 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              关闭
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}