"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { NotificationsContainer, type Notification } from "@/components/notifications"

interface NotificationsContextType {
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationsContext.Provider
      value={{
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      <NotificationsContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
