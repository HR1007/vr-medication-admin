import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Plays a student's recorded answer. The demo has no audio files, so it reads the
 * answer aloud with the browser's speech synthesis (zh-TW). The progress bar is
 * driven by a timer, so playback still "runs" when speech is unavailable or blocked.
 */
export function useSpeech() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  const spoken = useRef(false)

  const stop = useCallback(() => {
    window.clearInterval(timer.current)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    spoken.current = false
    setPlayingId(null)
    setProgress(0)
  }, [])

  useEffect(() => stop, [stop])

  const play = useCallback(
    (id: string, text: string, seconds: number) => {
      stop()
      setPlayingId(id)
      const started = performance.now()
      const duration = Math.max(seconds, text.length * 0.22) * 1000
      timer.current = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - started) / duration)
        setProgress(p)
        // Only the timer ends playback when speech isn't actually speaking.
        if (p >= 1 && !spoken.current) stop()
      }, 100)

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-TW'
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang === 'zh-TW' || v.lang.startsWith('zh'))
        if (voice) utterance.voice = voice
        utterance.onstart = () => {
          spoken.current = true
        }
        utterance.onend = stop
        // Blocked or failed speech: fall back to the timer-only progress.
        utterance.onerror = () => {
          spoken.current = false
        }
        window.speechSynthesis.speak(utterance)
      }
    },
    [stop],
  )

  return { playingId, progress, play, stop }
}
