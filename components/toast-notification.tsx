"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToastNotificationProps {
  message: string
  onDismiss: () => void
  duration?: number
  type?: "warning" | "success" | "info" | "error"
}

export function ToastNotification({ message, onDismiss, duration = 3000, type = "info" }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300) // Allow fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "bg-orange-600 text-white border-orange-700"
      case "success":
        return "bg-green-600 text-white border-green-700"
      case "error":
        return "bg-red-600 text-white border-red-700"
      default:
        return "bg-primary text-primary-foreground border-primary"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 max-w-sm ${getStyles()} ${
        isVisible ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {getIcon()}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-auto p-1 text-current hover:bg-white/20 flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
