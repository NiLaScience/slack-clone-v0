import React from "react"

interface CircleStatusProps {
  isOnline?: boolean
}

export function CircleStatus({ isOnline }: CircleStatusProps) {
  return (
    <div
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white
        ${isOnline ? "bg-green-500" : "bg-red-500"}
      `}
    />
  )
} 