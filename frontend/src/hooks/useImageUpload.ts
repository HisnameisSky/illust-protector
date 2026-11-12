// frontend/src/hooks/useImageUpload.ts
import { useState, useCallback } from "react";

interface UploadOptions {
  url: string;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
}

export function useImageUpload({ url, onSuccess, onError }: UploadOptions) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback((file: File) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", url, true);

    // アップロード進捗イベントの監視
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          onSuccess?.(response);
        } catch {
          onSuccess?.(xhr.responseText);
        }
      } else {
        const errMsg = `アップロードに失敗しました (ステータス: ${xhr.status})`;
        setError(errMsg);
        onError?.(errMsg);
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      const errMsg = "ネットワークエラーが発生しました";
      setError(errMsg);
      onError?.(errMsg);
    };

    xhr.send(formData);
  }, [url, onSuccess, onError]);

  return { upload, progress, loading, error };
}