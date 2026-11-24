import { describe, expect, it } from "vitest";

import { formatFileSize } from "./fileSize";

describe("formatFileSize", () => {
  it.each([
    [0, "0 bytes"],
    [820, "820 bytes"],
    [1024, "1 KB"],
    [1536, "1,5 KB"],
    [1024 * 1024 * 2, "2 MB"],
    [1024 * 1024 * 1.256, "1,26 MB"],
  ])("%s → %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
