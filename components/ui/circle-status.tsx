import React from "react"

interface CircleStatusProps {
  isOnline?: boolean
  status?: string
}

export function CircleStatus({ isOnline, status }: CircleStatusProps) {
  const getStatusColor = () => {
    if (!isOnline) return "bg-gray-500"
    if (status === "Busy") return "bg-yellow-500"
    if (status === "Away") return "bg-red-500"
    return "bg-green-500"
  }

  return (
    <div
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white
        ${getStatusColor()}
      `}
    />
  )
} 