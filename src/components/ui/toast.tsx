"use client";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: number;
  title: string;
  detail?: string;
  tone: ToastTone;
}

const ToastContext = createContext<(title: string, opts?: { detail?: string; tone?: ToastTone }) => void>(() => {});

export const useToast = () => useContext(ToastContext);

const TONE_TEXT: Record<ToastTone, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
};

/** Confirms that an action took effect. Stacks bottom right, clears itself. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (title: string, opts?: { detail?: string; tone?: ToastTone }) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-3), { id, title, detail: opts?.detail, tone: opts?.tone ?? "success" }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map((item) => {
          const Icon = item.tone === "success" ? Check : item.tone === "info" ? Info : TriangleAlert;
          return (
            <div key={item.id} role="status" className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-muted bg-container px-3 py-2.5 shadow-lg">
              <Icon size={15} strokeWidth={1.75} aria-hidden className={`mt-0.5 shrink-0 ${TONE_TEXT[item.tone]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-body-sm text-primary">{item.title}</p>
                {item.detail ? <p className="mt-0.5 text-caption text-tertiary">{item.detail}</p> : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-full p-0.5 text-quaternary transition-colors duration-[150ms] hover:text-primary"
              >
                <X size={13} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
