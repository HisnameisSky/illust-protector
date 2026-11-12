// 純粋なHTTP通信関数のみを定義（Reactに依存しない）
export async function uploadProtectedImage(file: File, author: string): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("author", author);

  const res = await fetch("/api/protect-workflow", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "画像処理に失敗しました");
  }

  return await res.blob();
}