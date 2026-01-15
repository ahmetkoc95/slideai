"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative max-h-[90vh] overflow-auto rounded-lg bg-white shadow-xl dark:bg-gray-900",
              {
                "w-full max-w-sm": size === "sm",
                "w-full max-w-md": size === "md",
                "w-full max-w-lg": size === "lg",
                "w-full max-w-2xl": size === "xl",
                "w-full max-w-[90vw]": size === "full",
              },
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!title && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-2 top-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
