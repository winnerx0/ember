import { Button } from "~/components/ui/button";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg" style={{ color: "var(--card-foreground)" }}>
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 justify-end" style={{ borderColor: "var(--border)" }}>
          <Button onClick={onClose} variant="outline">
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant={variant === "destructive" ? "destructive" : "default"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
