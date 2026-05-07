interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-foreground/60 mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-all cursor-pointer active:scale-[0.97] shadow-lg shadow-destructive/20"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
