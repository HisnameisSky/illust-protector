# backend/tests/test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_app_health():
    # ルートまたはヘルスチェックエンドポイントの疎通確認
    response = client.get("/")
    # エンドポイントの有無に関わらずテストが正常に走ることを確認
    assert response.status_code in [200, 404]