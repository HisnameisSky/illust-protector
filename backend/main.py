# backend/main.py
from typing import List
import asyncio
from fastapi import FastAPI, UploadFile, File, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect, Response, Request, Form
from fastapi.middleware.cors import CORSMiddleware
import os

# --- slowapiのインポート ---
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from services.validator import validate_image_file
from services.processor import process_illustration
from services.batch import batch_convert_to_webp

# !
from urllib.parse import quote
from services.processor import process_illustration, extract_invisible_watermark

# クライアントのIPアドレスをベースに制限をかけるリミッターを作成
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Illust Protector API", version="1.0.0")

# アプリケーションにリミッターを紐付け
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS設定（フロントエンドからのアクセス許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

THUMB_DIR = "thumbnails"
os.makedirs(THUMB_DIR, exist_ok=True)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Illust Protector Backend"}

# 1. 単体イラストの保護処理（AIノイズ付与 ＋ 著作権EXIF埋め込み）
# 👇 レートリミットを追加：1分間に最大10回までにする場合
@app.post("/api/protect-workflow")
@limiter.limit("10/minute")
async def protect_workflow(
    request: Request,
    file: UploadFile = Depends(validate_image_file),
    author: str = Form("ArtistName")
):
    content = await file.read()
    processed_bytes = process_illustration(content, artist_name=author)
    
    # マルチバイトのファイル名を安全にエンコード
    safe_filename = quote(file.filename or "image.jpg")
    
    return Response(
        content=processed_bytes,
        media_type="image/jpeg",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}"}
    )


# 2. 複数画像のWebP一括変換 ＆ ZIP出力
@app.post("/api/batch-convert-webp")
@limiter.limit("5/minute") # 重い一括処理は少し厳しめに制限（例: 1分に5回）
async def batch_convert(
    request: Request,
    files: List[UploadFile] = File(...)
):
    zip_bytes = await batch_convert_to_webp(files)
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=converted_webp.zip"}
    )

# 3. バックグラウンドタスクによる非同期サムネイル生成
def generate_thumbnail(file_bytes: bytes, filename: str):
    from io import BytesIO
    from PIL import Image
    img = Image.open(BytesIO(file_bytes))
    img.thumbnail((300, 300))
    save_path = os.path.join(THUMB_DIR, f"thumb_{filename}")
    img.save(save_path, format="JPEG", quality=85)

@app.post("/api/secure-async-upload")
async def secure_async_upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = Depends(validate_image_file)
):
    content = await file.read()
    background_tasks.add_task(generate_thumbnail, content, file.filename)
    return {
        "status": "accepted",
        "filename": file.filename,
        "message": "検証完了。バックグラウンドでサムネイルを生成中です。"
    }

# 4. WebSocketによるリアルタイム進捗配信
@app.websocket("/ws/batch-progress")
async def websocket_batch_progress(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.receive_text()
        total_steps = 5
        for step in range(1, total_steps + 1):
            await asyncio.sleep(0.6)
            progress = int((step / total_steps) * 100)
            await websocket.send_json({
                "progress": progress,
                "message": f"一括処理を実行中... ({step}/{total_steps})"
            })
        await websocket.send_json({"progress": 100, "message": "すべての処理が完了しました！"})
    except WebSocketDisconnect:
        print("クライアントとのWebSocket接続が切断されました")

# 5. 不可視ウォーターマークの抽出・検証API
@app.post("/api/verify-watermark")
@limiter.limit("10/minute") # 1分間に最大10回まで検証可能
async def verify_watermark(
    request: Request,
    file: UploadFile = Depends(validate_image_file)
):
    """
    アップロードされた画像から不可視ウォーターマークを抽出し、著作権情報を暴く
    """
    content = await file.read()
    
    try:
        # ウォーターマークの抽出（埋め込み時の文字数に合わせて watermark_length を調整。例: 32バイト）
        extracted_signature = extract_invisible_watermark(content, watermark_length=32)
        
        # 署名が空っぽ、あるいは文字化けしている場合は検知できなかったと判定
        if not extracted_signature.strip():
            return {
                "verified": False,
                "filename": file.filename,
                "message": "ウォーターマークが検出されませんでした（改変されている可能性があります）。"
            }
            
        return {
            "verified": True,
            "filename": file.filename,
            "signature": extracted_signature,
            "message": f"著作権を確認しました: {extracted_signature}"
        }
        
    except Exception as e:
        return {
            "verified": False,
            "filename": file.filename,
            "message": f"検証処理中にエラーが発生しました: {str(e)}"
        }