import React from "react"

interface CircleStatusProps {
  isOnline?: boolean;
  status?: string | null;
}

export function CircleStatus({ isOnline, status }: CircleStatusProps) {
  if (!isOnline && !status) return null;

  return (
    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
  );
} 