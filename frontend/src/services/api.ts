// frontend/src/services/api.ts

export interface ProtectionResult {
  message: string;
  filename: string;
  download_url: string;
}

/**
 * 画像ファイルをバックエンドに送信し、保護・ウォーターマーク処理を適用する
 */
export async function protectImage(file: File, watermarkText?: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (watermarkText) {
    formData.append('watermark_text', watermarkText);
  }

  // Viteのプロキシ設定により '/api' は 'http://localhost:8000' に転送されます
  const response = await fetch('/api/process', {
    method: 'POST',
    body: formData,
    // Content-Typeヘッダーは明示しない（FormDataが自動で boundary 付きのマルチパートを設定するため）
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '画像の保護処理に失敗しました。');
  }

  // 処理済みの画像ファイルをBlob（バイナリデータ）として受け取る
  return await response.blob();
}