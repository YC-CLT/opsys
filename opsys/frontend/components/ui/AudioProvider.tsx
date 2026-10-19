'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'

interface AudioContextValue {
  bgmEnabled: boolean
  sfxEnabled: boolean
  volume: number
  toggleBGM: () => void
  toggleSFX: () => void
  setVolume: (v: number) => void
  playBGM: (src: string, bgmVolume?: number) => void
  stopBGM: () => void
  playSFX: (src: string) => void
  bgmTrackIndex: number
  bgmTracks: string[]
  playNextBGM: () => void
  playPrevBGM: () => void
}

const AudioContext = createContext<AudioContextValue>({
  bgmEnabled: true,
  sfxEnabled: true,
  volume: 0.3,
  toggleBGM: () => {},
  toggleSFX: () => {},
  setVolume: () => {},
  playBGM: () => {},
  stopBGM: () => {},
  playSFX: () => {},
  bgmTrackIndex: 0,
  bgmTracks: [],
  playNextBGM: () => {},
  playPrevBGM: () => {},
})

const STORAGE_KEYS = {
  bgm: 'opsys-audio-bgm',
  sfx: 'opsys-audio-sfx',
  volume: 'opsys-audio-volume',
}

const BGM_TRACKS = [
  '/audio/bg1.mp3',
  '/audio/bg2.mp3',
  '/audio/bg3.mp3',
  '/audio/bg4.mp3',
  '/audio/bg5.mp3',
]

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const sfxPool = useRef<Set<HTMLAudioElement>>(new Set())
  const bgmVolumeRef = useRef<number>(1)
  const currentSrcRef = useRef<string | null>(null)
  const [bgmEnabled, setBgmEnabledState] = useState(true)
  const [sfxEnabled, setSfxEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(0.3)
  const [bgmTrackIndex, setBgmTrackIndex] = useState(0)

  useEffect(() => {
    const savedBgm = localStorage.getItem(STORAGE_KEYS.bgm)
    const savedSfx = localStorage.getItem(STORAGE_KEYS.sfx)
    const savedVol = localStorage.getItem(STORAGE_KEYS.volume)
    if (savedBgm !== null) setBgmEnabledState(savedBgm === 'true')
    if (savedSfx !== null) setSfxEnabledState(savedSfx === 'true')
    if (savedVol !== null) setVolumeState(parseFloat(savedVol))
  }, [])

  const toggleBGM = useCallback(() => {
    setBgmEnabledState((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEYS.bgm, String(next))
      if (bgmRef.current) {
        if (next) {
          bgmRef.current.play().catch(() => {})
        } else {
          bgmRef.current.pause()
        }
      }
      return next
    })
  }, [])

  const toggleSFX = useCallback(() => {
    setSfxEnabledState((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEYS.sfx, String(next))
      return next
    })
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    localStorage.setItem(STORAGE_KEYS.volume, String(clamped))
    if (bgmRef.current) bgmRef.current.volume = clamped
  }, [])

  const playBGM = useCallback((src: string, bgmVolume?: number) => {
    currentSrcRef.current = src
    bgmVolumeRef.current = bgmVolume ?? 1
    if (!bgmEnabled) return
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current = null
    }
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume * bgmVolumeRef.current
    audio.play().catch(() => {})
    bgmRef.current = audio
  }, [bgmEnabled, volume])

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current = null
    }
  }, [])

  const playNextBGM = useCallback(() => {
    setBgmTrackIndex((prev) => {
      const next = (prev + 1) % BGM_TRACKS.length
      playBGM(BGM_TRACKS[next], bgmVolumeRef.current)
      return next
    })
  }, [playBGM])

  const playPrevBGM = useCallback(() => {
    setBgmTrackIndex((prev) => {
      const next = (prev - 1 + BGM_TRACKS.length) % BGM_TRACKS.length
      playBGM(BGM_TRACKS[next], bgmVolumeRef.current)
      return next
    })
  }, [playBGM])

  const playSFX = useCallback((src: string) => {
    if (!sfxEnabled) return
    const audio = new Audio(src)
    audio.volume = volume
    audio.play().catch(() => {})
    audio.onended = () => {
      sfxPool.current.delete(audio)
    }
    sfxPool.current.add(audio)
  }, [sfxEnabled, volume])

  // Global click sound
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        playSFX('/audio/click.wav')
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [playSFX])

  return (
    <AudioContext.Provider value={{ bgmEnabled, sfxEnabled, volume, toggleBGM, toggleSFX, setVolume, playBGM, stopBGM, playSFX, bgmTrackIndex, bgmTracks: BGM_TRACKS, playNextBGM, playPrevBGM }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}