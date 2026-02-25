"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; message: string; type: ToastType };

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void;
}>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-rise flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              t.type === "success"
                ? "border-[rgba(45,93,49,0.3)] bg-white text-[var(--moss)]"
                : t.type === "error"
                  ? "border-[rgba(196,107,46,0.3)] bg-white text-[var(--ember)]"
                  : "border-[rgba(17,24,39,0.12)] bg-white text-[rgba(17,24,39,0.7)]"
            }`}
          >
            {t.type === "success" && <Check className="h-4 w-4 flex-shrink-0" />}
            {t.type === "error" && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
            {t.type === "info" && <Info className="h-4 w-4 flex-shrink-0" />}
            <span className="text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-50 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
