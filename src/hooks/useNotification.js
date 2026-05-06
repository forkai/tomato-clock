import { useCallback } from 'react';

/**
 * 通知提醒 Hook
 * 封装系统通知、提示音、悬浮窗口功能
 */
export function useNotification() {
  // 播放提示音
  const playSound = useCallback(() => {
    // 创建 Web Audio API 上下文
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置提示音参数
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // 渐出效果
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  // 显示系统通知
  const showSystemNotification = useCallback((title, body) => {
    if (window.electronAPI?.showNotification) {
      window.electronAPI.showNotification(title, body);
    }
  }, []);

  // 显示悬浮窗口
  const showFloatingWindow = useCallback((message) => {
    if (window.electronAPI?.showNotificationWindow) {
      window.electronAPI.showNotificationWindow(message);
    }
  }, []);

  // 完整的番茄钟完成通知
  const notifyPomodoroComplete = useCallback((mode) => {
    const isBreak = mode !== 'work';
    const title = isBreak ? '休息结束！' : '番茄钟完成！';
    const body = isBreak
      ? '休息时间结束，开始下一个专注周期吧'
      : '25分钟专注完成，休息一下吧';

    // 显示系统通知
    showSystemNotification(title, body);

    // 播放提示音
    playSound();

    // 显示悬浮窗口
    showFloatingWindow(isBreak ? '开始工作!' : '休息一下');
  }, [showSystemNotification, playSound, showFloatingWindow]);

  return {
    playSound,
    showSystemNotification,
    showFloatingWindow,
    notifyPomodoroComplete
  };
}