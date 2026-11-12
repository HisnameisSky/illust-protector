// 見た目の構築とフックの呼び出しにのみ集中する純粋なUI
import React, { useState } from "react";
import { useImageProtection } from "../hooks/useImageProtection";

export function ProtectionCard() {
  const { protect, loading, error } = useImageProtection();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await protect(file, "HisnameisSky");
    if (url) setPreviewUrl(url);
  };

  return (
    <div className="p-6 bg-neutral-900 text-neutral-100 rounded-2xl max-w-sm shadow-xl">
      <input type="file" onChange={handleFileChange} disabled={loading} className="mb-4 text-sm" />
      {loading && <p className="text-xs text-indigo-400">保護処理を実行中...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {previewUrl && <img src={previewUrl} alt="Protected" className="mt-4 rounded-lg shadow-md" />}
    </div>
  );
}