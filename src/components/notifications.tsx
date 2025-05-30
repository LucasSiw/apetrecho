"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationProps) {
  const { id, type, title, message, duration = 5000 } = notification

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onRemove])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const Icon = icons[type]

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const iconStyles = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
  }

  return (
    <div className={cn("rounded-lg border p-4 shadow-lg", styles[type])}>
      <div className="flex items-start">
        <Icon className={cn("h-5 w-5 mt-0.5 mr-3", iconStyles[type])} />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(id)}
          className="ml-2 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface NotificationsContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationsContainer({ notifications, onRemove }: NotificationsContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRemove={onRemove} />
      ))}
    </div>
  )
}
