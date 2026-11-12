# backend/services/processor.py
from io import BytesIO
import numpy as np
from PIL import Image
import piexif

# Added:
import cv2
from imwatermark import WatermarkEncoder
from imwatermark import WatermarkDecoder

# Exif reader:
def process_illustration(image_bytes: bytes, artist_name: str = "ArtistName") -> bytes:
    """
    アップロードされたイラストにAI学習対策ノイズを付与し、
    著作権メタデータ（EXIF）を埋め込んでJPEG形式で出力する。
    """
    # 1. Pillowで画像をオープンし、RGBに正規化
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    
    # 2. NumPy配列に変換してAI学習対策の微小なランダムノイズを付与
    img_np = np.array(img).astype(np.float32)
    # 人間の目には識別できないレベルの微小なノイズ（標準偏差 1.5）
    noise = np.random.normal(0, 1.5, img_np.shape)
    img_np = np.clip(img_np + noise, 0, 255).astype(np.uint8)
    processed_img = Image.fromarray(img_np)
    
    # 3. piexifでメタデータを構築（作者名・著作権表示）
    # Latin-1範囲外の文字（日本語など）によるエンコードエラーを防ぐため安全に変換
    safe_artist = artist_name.encode("latin-1", errors="ignore").decode("latin-1")
    if not safe_artist.strip():
        safe_artist = "Artist"

    zeroth_ifd = {
        piexif.ImageIFD.Artist: safe_artist,
        piexif.ImageIFD.Copyright: f"Copyright (C) {safe_artist}. All rights reserved.",
    }
    exif_dict = {"0th": zeroth_ifd}
    exif_bytes = piexif.dump(exif_dict)


    # 4. バイトバッファに書き出して返す（品質92維持）
    output_buffer = BytesIO()
    processed_img.save(output_buffer, format="JPEG", quality=92, exif=exif_bytes)
    output_buffer.seek(0)
    
    return output_buffer.getvalue()

# Watermark sign:
def add_invisible_watermark(image_bytes: bytes, secret_text: str = "_Protected") -> bytes:
    """
    画像の周波数領域（DWT-DCT）に不可視の文字列ウォーターマークを埋め込む
    """
    # 1. バイトデータをOpenCVの画像形式（BGR配列）にデコード
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("画像のデコードに失敗しました。")

    # 2. ウォーターマークエンコーダーの初期化
    encoder = WatermarkEncoder()
    encoder.set_watermark('bytes', secret_text.encode('utf-8'))
    
    # 3. DWT-DCTアルゴリズムでウォーターマークを埋め込む
    # （再エンコードやノイズに比較的強い方式）
    watermarked_img = encoder.encode(img, 'dwtDct')
    
    # 4. JPEG形式（品質92）のバイト列に再エンコードして出力
    success, encoded_buffer = cv2.imencode('.jpg', watermarked_img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if not success:
        raise RuntimeError("ウォーターマーク埋め込み後のエンコードに失敗しました。")
        
    return encoded_buffer.tobytes()

# watermark validator:

def extract_invisible_watermark(image_bytes: bytes, watermark_length: int = 32) -> str:
    """
    画像から不可視ウォーターマーク（DWT-DCT方式）を抽出する
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("検証用画像のデコードに失敗しました。")

    # デコーダーの初期化（埋め込み時に設定したバイト長：文字数×8ビット）
    decoder = WatermarkDecoder('bytes', watermark_length * 8)
    
    try:
        # 抽出の実行
        watermark_bytes = decoder.decode(img, 'dwtDct')
        return watermark_bytes.decode('utf-8', errors='ignore').rstrip('\x00')
    except Exception as e:
        raise RuntimeError(f"ウォーターマークの復元に失敗しました: {str(e)}")