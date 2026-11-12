# FastAPI: Dependsで使い回せるファイル形式・サイズの厳格な検証ロジック
from fastapi import UploadFile, File, HTTPException, status

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB上限
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

async def validate_image_file(file: UploadFile = File(...)) -> UploadFile:
    # 1. MIMEタイプの検証
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"無効なファイル形式です ({file.content_type})。JPEG, PNG, WEBPのみ対応しています。"
        )
    
    # 2. ファイルサイズの検証
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"ファイルサイズが大きすぎます（上限: {MAX_FILE_SIZE // (1024*1024)}MB）。"
        )
        
    return file