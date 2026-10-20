'use client'

export { AudioProvider, useAudio } from '@/components/ui/AudioProvider'

export const AUDIO = {
  bgm: {
    bg1: '/audio/bg1.mp3',
    bg2: '/audio/bg2.mp3',
    bg3: '/audio/bg3.mp3',
    bg4: '/audio/bg4.mp3',
    bg5: '/audio/bg5.mp3',
    settings: '/audio/SettingsUI.mp3',
  },
  sfx: {
    success: '/audio/SUCCESS.mp3',
    fail: '/audio/FAIL.wav',
    click: '/audio/click.wav',
    terminal: '/audio/InitTerminal.wav',
  },
  bgmTracks: [
    '/audio/bg1.mp3',
    '/audio/bg2.mp3',
    '/audio/bg3.mp3',
    '/audio/bg4.mp3',
    '/audio/bg5.mp3',
  ],
} as const