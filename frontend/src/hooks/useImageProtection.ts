// frontend/src/hooks/useImageProtection.ts
import { useState } from 'react';
import { protectImage } from '../services/api';

export function useImageProtection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      // API呼び出し
      const processedBlob = await protectImage(file, "DO NOT REPRODUCE");

      // ダウンロード用のURLを生成してプレビューや保存に利用
      const downloadUrl = URL.createObjectURL(processedBlob);
      return downloadUrl;

    } catch (err: any) {
      setError(err.message || '予期せぬエラーが発生しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleProcess, loading, error };
}