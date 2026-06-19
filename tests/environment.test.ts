import { describe, expect, it } from "vitest";
import {
  getBrowserInfo,
  getOperatingSystemInfo,
  getScreenSizeLabel
} from "@/lib/environment";

describe("environment helpers", () => {
  it("detects Chrome and macOS from a user agent", () => {
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

    expect(getBrowserInfo(userAgent)).toBe("Chrome 126");
    expect(getOperatingSystemInfo(userAgent)).toBe("macOS");
  });

  it("detects Safari without labeling Chrome as Safari", () => {
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

    expect(getBrowserInfo(userAgent)).toBe("Safari 17.5");
  });

  it("formats screen dimensions", () => {
    expect(getScreenSizeLabel(390, 844)).toBe("390 x 844");
  });
});
