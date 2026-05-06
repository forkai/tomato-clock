import { useCallback } from 'react'
import type { SessionType } from '@/types/timer'

/**
 * 通知管理 Hook
 * 提供多种通知方式来提醒用户番茄钟状态：
 * - 系统通知（桌面通知）
 * - 浮窗通知（Electron 窗口）
 * - 声音提醒（蜂鸣音）
 */
export function useNotification() {
  /**
   * 播放提示音
   * 使用 Web Audio API 生成一个简单的蜂鸣声
   * 用于在后台或通知被禁用时提供声音提醒
   */
  const playSound = useCallback(() => {
    // 创建音频上下文（兼容 Safari 的 webkit 前缀）
    const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // 连接节点：振荡器 -> 增益 -> 扬声器
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 设置频率为 800Hz（普通蜂鸣音）
    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    // 设置音量渐变：0.3 -> 0.01（0.5秒内）
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    // 播放 0.5 秒后停止
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }, [])

  /**
   * 显示系统通知
   * 使用 Electron 的 Notification API（如果可用）
   * @param title 通知标题
   * @param body 通知正文
   */
  const showSystemNotification = useCallback((title: string, body: string) => {
    // 通过 IPC 调用主进程的 Notification
    if (window.electronAPI?.showNotification) {
      window.electronAPI.showNotification(title, body)
    }
  }, [])

  /**
   * 显示浮窗通知
   * 在桌面右上角显示一个小型通知窗口
   * @param message 要显示的消息
   */
  const showFloatingWindow = useCallback((message: string) => {
    // 通过 IPC 调用主进程创建浮窗
    if (window.electronAPI?.showNotificationWindow) {
      window.electronAPI.showNotificationWindow(message)
    }
  }, [])

  /**
   * 番茄钟完成时的综合通知
   * 同时触发：系统通知 + 声音 + 浮窗
   * @param mode 完成时的模式
   */
  const notifyPomodoroComplete = useCallback((mode: SessionType) => {
    // 判断是工作完成还是休息结束
    const isBreak = mode !== 'work'

    // 根据模式设置通知标题和内容
    const title = isBreak ? '休息结束！' : '番茄钟完成！'
    const body = isBreak
      ? '休息时间结束，开始下一个专注周期吧'
      : '25分钟专注完成，休息一下吧'

    // 三种通知方式同时触发
    showSystemNotification(title, body) // 系统桌面通知
    playSound()                          // 蜂鸣提示音
    showFloatingWindow(isBreak ? '开始工作!' : '休息一下') // 浮窗提示
  }, [showSystemNotification, playSound, showFloatingWindow])

  return {
    playSound,
    showSystemNotification,
    showFloatingWindow,
    notifyPomodoroComplete
  }
}