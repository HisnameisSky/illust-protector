// frontend/src/App.tsx
import React, { useState } from "react";
import { Dropzone } from "./components/Dropzone";
import { Watermark } from "./components/Watermark";
import { Progress } from "./components/Progress";

// App.tsx の handleStartProtection の書き換え例
import { uploadProtectedImage } from "./services/imageServices";

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleStartProtection = async () => {
  if (!selectedFile) return;
  setIsProcessing(true);
  setProgress(20);
  setStatusMessage("AIノイズ付与とEXIF埋め込みを実行中...");

  try {
    // バックエンドの /api/protect-workflow を直接叩く！
    setProgress(50);
    const processedBlob = await uploadProtectedImage(selectedFile, "HisnameisSky");
    
    setProgress(90);
    setStatusMessage("保護処理が完了しました！ダウンロードを開始します。");

    // ダウンロード用リンクの生成
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protected_${selectedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setProgress(100);
    setStatusMessage("すべての処理が完了しました！");
  } catch (err: any) {
    setStatusMessage(`エラー: ${err.message || "処理に失敗しました"}`);
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ヘッダー */}
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Illust Protector 澄界
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            AI学習対策ノイズ・著作権メタデータ埋め込み・高圧縮WebP一括保護システム
          </p>
        </div>
        <span className="text-xs px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-indigo-400 font-mono shadow-inner">
          v1.0.0 Stable
        </span>
      </header>

      {/* メインコンテンツ（2カラムレイアウト） */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 左カラム：アップロード・コントロール */}
        <div className="space-y-6">
          <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              1. イラストのドロップ＆選択
            </h2>
            <Dropzone onFilesSelected={handleFilesSelected} />
          </section>

          {selectedFile && (
            <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-medium truncate max-w-[240px]">
                  {selectedFile.name}
                </span>
                <span className="text-neutral-400 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={handleStartProtection}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isProcessing ? "保護パイプライン実行中..." : "保護＆EXIF埋め込みを開始"}
              </button>
            </section>
          )}

          <Progress progress={progress} message={statusMessage} isVisible={isProcessing} />
        </div>

        {/* 右カラム：リアルタイムプレビュー */}
        <div className="space-y-6">
          <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              2. 透かし・オーバーレイプレビュー
            </h2>
            <Watermark file={selectedFile} />
          </section>
        </div>

      </main>
    </div>
  );
}

export default App;