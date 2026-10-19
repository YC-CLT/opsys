'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'

interface AudioContextValue {
  bgmEnabled: boolean
  sfxEnabled: boolean
  volume: number
  toggleBGM: () => void
  toggleSFX: () => void
  setVolume: (v: number) => void
  playBGM: (src: string) => void
  stopBGM: () => void
  playSFX: (src: string) => void
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
})

const STORAGE_KEYS = {
  bgm: 'opsys-audio-bgm',
  sfx: 'opsys-audio-sfx',
  volume: 'opsys-audio-volume',
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const sfxPool = useRef<Set<HTMLAudioElement>>(new Set())
  const [bgmEnabled, setBgmEnabledState] = useState(true)
  const [sfxEnabled, setSfxEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(0.3)

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

  const playBGM = useCallback((src: string) => {
    if (!bgmEnabled) return
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current = null
    }
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audio.play().catch(() => {})
    bgmRef.current = audio
  }, [bgmEnabled, volume])

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current = null
    }
  }, [])

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

  return (
    <AudioContext.Provider value={{ bgmEnabled, sfxEnabled, volume, toggleBGM, toggleSFX, setVolume, playBGM, stopBGM, playSFX }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}