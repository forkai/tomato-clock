import React from 'react';

/**
 * 通知 Toast 组件（备用展示）
 * 当悬浮窗口不可用时可在主窗口展示
 */
export function NotificationToast({ message, type = 'info', onClose }) {
  const bgColors = {
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div
      className={`fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 hover:opacity-70">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
