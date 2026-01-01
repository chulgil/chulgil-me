"use client";

import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        bg-ebony text-ivory px-6 py-3 rounded-full
        shadow-xl border border-gold/30
        animate-slide-up"
    >
      <div className="flex items-center gap-3">
        <span className="text-gold">♪</span>
        <span className="font-body text-sm">{message}</span>
        <span className="text-gold">♪</span>
      </div>
    </div>
  );
}

// Toast hook for easy usage
export function useToast() {
  const [toast, setToast] = useState({ message: "", isVisible: false });

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast({ message: "", isVisible: false });
  };

  return { toast, showToast, hideToast };
}
