# Illust Protector 澄界 (Sumikai)

イラストレーターの創作物をAI学習クローラーや不正スクレイピング、無断転載から守るためのローカル完結型・多層防御アプリケーションです。

## 🛡️ 主な保護・セキュリティ機能

1. **AI学習阻害ノイズ & 著作権EXIF埋め込み**
   * 画像の視覚品質を保ちつつAIの特徴抽出を妨げるノイズ付与と、`piexif` を用いた作者名・著作権情報のメタデータ埋め込みを実行します。
   * 日本語・マルチバイト文字を含むファイル名や作者名にも完全対応（RFC 5987準拠ヘッダー出力）。
2. **不可視ウォーターマーク（DWT-DCT方式）**
   * 周波数領域（DWT-DCT）に署名データを埋め込み、SNSアップロード時のリサイズやJPEG再圧縮を経ても著作権情報を抽出・検証（`/api/verify-watermark`）できます。
3. **APIレートリミッティング & クローラー対策**
   * `slowapi` によるIP単位のアクセス制限（1分間あたりのリクエスト上限）と `robots.txt` によるAIクローラー拒否設定を備えています。
4. **フロントエンド保存ガード**
   * Canvasによるリアルタイム斜め透かしオーバーレイに加え、`onContextMenu` 封鎖・ドラッグ無効化・ポインタイベント制御によりブラウザ上での直感的な画像保存を抑止します。

## 🛠️ 技術スタック

* **Backend:** Python 3.14 / FastAPI / Uvicorn / Pillow / NumPy / OpenCV / invisible-watermark / piexif / slowapi
* **Frontend:** TypeScript / React / Vite / Tailwind CSS

## 🚀 ローカル環境での起動手順（生起動スタイル）

Dockerを使用せず、ローカル環境で直接バックエンドとフロントエンドを起動します。

### 1. バックエンドの起動（FastAPI）

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windowsの場合: .venv\Scripts\activate

# バイナリ優先で依存パッケージをインストール
pip install --prefer-binary -r requirements.txt

# 開発サーバーの起動 ([http://127.0.0.1:8000](http://127.0.0.1:8000))
uvicorn main:app --reload --port 8000
```

### 2. フロントエンドの起動（React + Vite）
別のターミナルを開き、以下を実行します。
```bash
cd frontend
npm install --legacy-peer-deps

# 開発サーバーの起動 (http://localhost:5173)
npm run dev
```

## 📄 License
All rights reserved by HisnameisSky (澄界).