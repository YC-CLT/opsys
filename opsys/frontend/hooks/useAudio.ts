'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const VOLUME_STORAGE_KEY = 'opsys-audio-volume'
const DEFAULT_VOLUME = 0.3

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VOLUME_STORAGE_KEY)
      if (saved) setVolumeState(parseFloat(saved))
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current && audioSrc) {
      audioRef.current = new Audio(audioSrc)
      audioRef.current.loop = true
      audioRef.current.volume = volume
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioSrc, volume])

  const load = useCallback((src: string) => {
    setAudioSrc(src)
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [isPlaying])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped))
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
  }, [])

  return { isPlaying, volume, togglePlay, setVolume, load }
}