// frontend/src/components/Progress.tsx
import React from "react";

interface ProgressProps {
  progress: number;
  message: string;
  isVisible: boolean;
}

export function Progress({ progress, message, isVisible }: ProgressProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-neutral-300 font-medium truncate pr-2">{message}</span>
        <span className="text-indigo-400 font-bold shrink-0">{progress}%</span>
      </div>
      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}