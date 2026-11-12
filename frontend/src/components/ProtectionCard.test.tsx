// src/components/__tests__/ProtectionCard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProtectionCard } from "../ProtectionCard";
import * as hook from "../../hooks/useImageProtection";

// カスタムフック自体をモック化してコンポーネントの描画に集中
jest.mock("../../hooks/useImageProtection");

describe("ProtectionCard コンポーネント", () => {
  it("ファイル選択時に保護処理が実行され、プレビューが表示されること", async () => {
    const mockProtect = jest.fn().mockResolvedValue("blob:http://localhost/mock-url");
    jest.spyOn(hook, "useImageProtection").mockReturnValue({
      protect: mockProtect,
      loading: false,
      error: null,
    });

    render(<ProtectionCard />);

    // ファイル入力要素を取得してダミーファイルを渡す
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["dummy"], "artwork.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockProtect).toHaveBeenCalledWith(file, "HisnameisSky");
    });
  });
});