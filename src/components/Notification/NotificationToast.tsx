interface NotificationToastProps {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  onClose?: () => void
}

export function NotificationToast({ message, type = 'info', onClose }: NotificationToastProps) {
  const bgColors = {
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }

  return (
    <div
      className={`fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer">
            ×
          </button>
        )}
      </div>
    </div>
  )
}
