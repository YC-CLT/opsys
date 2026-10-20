'use client'

export { AudioProvider, useAudio } from '@/components/ui/AudioProvider'
import { asset } from '@/lib/asset-path'

export const AUDIO = {
  bgm: {
    bg1: asset('/audio/bg1.mp3'),
    bg2: asset('/audio/bg2.mp3'),
    bg3: asset('/audio/bg3.mp3'),
    bg4: asset('/audio/bg4.mp3'),
    bg5: asset('/audio/bg5.mp3'),
    settings: asset('/audio/SettingsUI.mp3'),
  },
  sfx: {
    success: asset('/audio/SUCCESS.mp3'),
    fail: asset('/audio/FAIL.wav'),
    click: asset('/audio/click.wav'),
    terminal: asset('/audio/InitTerminal.wav'),
  },
  bgmTracks: [
    asset('/audio/bg1.mp3'),
    asset('/audio/bg2.mp3'),
    asset('/audio/bg3.mp3'),
    asset('/audio/bg4.mp3'),
    asset('/audio/bg5.mp3'),
  ],
} as const