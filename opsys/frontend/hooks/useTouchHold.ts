'use client'

import { useRef, useCallback } from 'react'

interface UseTouchHoldOptions {
  threshold?: number
  vibrateDuration?: number
  onHoldStart?: () => void
  onHoldEnd?: () => void
}

export function useTouchHold({
  threshold = 200,
  vibrateDuration = 10,
  onHoldStart,
  onHoldEnd,
}: UseTouchHoldOptions = {}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTriggered = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onTouchStart = useCallback(() => {
    holdTriggered.current = false
    timerRef.current = setTimeout(() => {
      holdTriggered.current = true
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(vibrateDuration)
      }
      onHoldStart?.()
    }, threshold)
  }, [threshold, vibrateDuration, onHoldStart])

  const onTouchEnd = useCallback(() => {
    clearTimer()
    if (holdTriggered.current) {
      holdTriggered.current = false
      onHoldEnd?.()
    }
  }, [clearTimer, onHoldEnd])

  const onTouchMove = useCallback(() => {
    clearTimer()
  }, [clearTimer])

  const isHolding = useCallback(() => holdTriggered.current, [])

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    isHolding,
  }
}