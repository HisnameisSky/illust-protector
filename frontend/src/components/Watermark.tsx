// frontend/src/components/Watermark.tsx
import React, { useEffect, useRef } from "react";

interface WatermarkProps {
  file: File | null;
  text?: string;
}

export function Watermark({ file, text = "DO NOT REPOST / ArtistName" }: WatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // 1. Canvasサイズを画像の縦横比に合わせて設定
      canvas.width = img.width;
      canvas.height = img.height;

      // 2. 元画像を描画
      ctx.drawImage(img, 0, 0);

      // 3. ウォーターマークのスタイル設定（半透明・斜めテキスト）
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.font = `bold ${Math.max(16, Math.floor(canvas.width / 20))}px sans-serif`;

      // 対角線状に繰り返しテクスチャを描画
      const stepX = canvas.width / 3;
      const stepY = canvas.height / 4;

      ctx.rotate((-20 * Math.PI) / 180);
      for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [file, text]);

  if (!file) {
    return (
      <div className="w-full h-64 border border-neutral-800 rounded-2xl bg-neutral-900/30 flex items-center justify-center text-neutral-400 text-xs select-none">
        ファイルを選択するとプレビューが表示されます
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto rounded-xl object-contain max-h-[500px] pointer-events-none" 
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}