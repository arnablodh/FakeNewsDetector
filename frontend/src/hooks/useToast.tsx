import React, { createContext, useContext, useState, ReactNode } from 'react';

type Toast = { message: string; type: 'success' | 'error' | 'info' };

type ToastContextProps = {
  addToast: (toast: Toast) => void;
};

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    // auto‑remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== toast));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Render toast UI */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded shadow-md text-sm font-medium ${
              t.type === 'success'
                ? 'bg-success text-success-foreground'
                : t.type === 'error'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
