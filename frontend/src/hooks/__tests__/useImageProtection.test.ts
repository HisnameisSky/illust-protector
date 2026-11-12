//本日のメニュー：Jest & React Testing Libraryによる効率的なテスト手法

// src/hooks/__tests__/useImageProtection.test.ts
import { renderHook, act } from "@testing-library/react";
import { useImageProtection } from "../useImageProtection";
import * as service from "../../services/imageService";

// API通信部分をモック化
jest.mock("../../services/imageService");

describe("useImageProtection カスタムフック", () => {
  it("画像を正常に保護処理し、プレビュー用URLを返すこと", async () => {
    const mockBlob = new Blob(["dummy data"], { type: "image/jpeg" });
    jest.spyOn(service, "uploadProtectedImage").mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useImageProtection());
    const file = new File(["dummy"], "test.png", { type: "image/png" });

    let url: string | null = null;
    await act(async () => {
      url = await result.current.protect(file, "HisnameisSky");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(url).toContain("blob:");
  });
});