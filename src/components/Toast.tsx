"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

let toastId = 0;
let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify(type: Toast["type"], message: string) {
  const id = ++toastId;
  toasts = [...toasts, { id, type, message }];
  listeners.forEach((l) => l([...toasts]));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...toasts]));
  }, 3000);
}

export const toast = {
  success: (msg: string) => notify("success", msg),
  error: (msg: string) => notify("error", msg),
  warning: (msg: string) => notify("warning", msg),
  info: (msg: string) => notify("info", msg),
};

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

function ToastItem({
  t,
  onDismiss,
}: {
  t: Toast;
  onDismiss: (id: number) => void;
}) {
  const config = typeConfig[t.type];
  const Icon = config.icon;

  return (
    <div
      className={`animate-slide-in-right flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${config.bg}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.text}`}>{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className={`ml-2 shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 ${config.text}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [currentToasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...toasts]));
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      {currentToasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
