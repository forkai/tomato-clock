import { useCallback } from 'react'
import type { SessionType } from '@/types/timer'

export function useNotification() {
  const playSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }, [])

  const showSystemNotification = useCallback((title: string, body: string) => {
    if (window.electronAPI?.showNotification) {
      window.electronAPI.showNotification(title, body)
    }
  }, [])

  const showFloatingWindow = useCallback((message: string) => {
    if (window.electronAPI?.showNotificationWindow) {
      window.electronAPI.showNotificationWindow(message)
    }
  }, [])

  const notifyPomodoroComplete = useCallback((mode: SessionType) => {
    const isBreak = mode !== 'work'
    const title = isBreak ? '休息结束！' : '番茄钟完成！'
    const body = isBreak
      ? '休息时间结束，开始下一个专注周期吧'
      : '25分钟专注完成，休息一下吧'

    showSystemNotification(title, body)
    playSound()
    showFloatingWindow(isBreak ? '开始工作!' : '休息一下')
  }, [showSystemNotification, playSound, showFloatingWindow])

  return {
    playSound,
    showSystemNotification,
    showFloatingWindow,
    notifyPomodoroComplete
  }
}
