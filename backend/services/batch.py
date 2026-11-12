# backend/services/batch.py
from typing import List
from io import BytesIO
import zipfile
from fastapi import UploadFile
from PIL import Image

async def batch_convert_to_webp(files: List[UploadFile]) -> bytes:
    """
    複数のアップロード画像を高品質かつ高圧縮なWebP形式に一括変換し、
    ZIPアーカイブのバイトデータを生成して返す。
    """
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file in files:
            image_bytes = await file.read()
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            
            webp_buffer = BytesIO()
            # quality=85 で画質を維持しつつ、method=6 でファイルサイズを限界まで圧縮
            img.save(webp_buffer, format="WEBP", quality=85, method=6)
            
            # 元のファイル名から拡張子を除き、.webp に置き換え
            base_name = file.filename.rsplit(".", 1)[0] if file.filename else "image"
            new_filename = f"{base_name}.webp"
            
            zip_file.writestr(new_filename, webp_buffer.getvalue())
            
    zip_buffer.seek(0)
    return zip_buffer.getvalue()