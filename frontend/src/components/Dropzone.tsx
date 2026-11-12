// frontend/src/components/Dropzone.tsx
import React, { useState, useCallback } from "react";

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
}

export function Dropzone({ 
  onFilesSelected, 
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"] 
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      acceptedTypes.length === 0 || acceptedTypes.includes(file.type)
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, acceptedTypes]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
          : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-900"
      }`}
    >
      <input
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
        <svg className="w-10 h-10 text-neutral-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-neutral-200">
          イラストファイルをここにドラッグ＆ドロップ、または<span className="text-indigo-400 underline ml-1">ファイルを選択</span>
        </p>
        <p className="text-xs text-neutral-400">
          JPEG, PNG, WEBP形式に対応（最大10MB）
        </p>
      </div>
    </div>
  );
}