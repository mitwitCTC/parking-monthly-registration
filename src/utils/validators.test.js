import { describe, it, expect } from "vitest";
import {
  isValidPhone,
  isValidCarNumber,
  isValidCarrier,
  isValidEmail,
  isValidTaxId,
} from "./validators.js";

describe("isValidPhone", () => {
  it("accepts 09 + 8 digits", () => {
    expect(isValidPhone("0912345678")).toBe(true);
  });
  it("rejects non-09 prefix", () => {
    expect(isValidPhone("0812345678")).toBe(false);
  });
  it("rejects wrong length", () => {
    expect(isValidPhone("091234567")).toBe(false);
    expect(isValidPhone("09123456789")).toBe(false);
  });
  it("rejects empty / nullish", () => {
    expect(isValidPhone("")).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });
});

describe("isValidCarNumber", () => {
  it("accepts common formats", () => {
    expect(isValidCarNumber("ABC-1234")).toBe(true);
    expect(isValidCarNumber("1234-TT")).toBe(true);
    expect(isValidCarNumber("AB-1234")).toBe(true);
  });
  it("is case insensitive", () => {
    expect(isValidCarNumber("abc-1234")).toBe(true);
  });
  it("trims whitespace", () => {
    expect(isValidCarNumber("  ABC-1234  ")).toBe(true);
  });
  it("rejects missing hyphen", () => {
    expect(isValidCarNumber("ABC1234")).toBe(false);
  });
  it("rejects empty", () => {
    expect(isValidCarNumber("")).toBe(false);
  });
});

describe("isValidCarrier", () => {
  it("accepts / + 7 chars", () => {
    expect(isValidCarrier("/ABC+123")).toBe(true);
    expect(isValidCarrier("/AB.-+12")).toBe(true);
  });
  it("rejects without leading slash", () => {
    expect(isValidCarrier("ABC+1234")).toBe(false);
  });
  it("rejects wrong length", () => {
    expect(isValidCarrier("/ABC123")).toBe(false);
    expect(isValidCarrier("/ABC12345")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts basic emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("foo.bar+tag@sub.example.co")).toBe(true);
  });
  it("rejects missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });
  it("rejects missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });
});

describe("isValidTaxId", () => {
  // 已知合法統編
  it("accepts known valid tax IDs", () => {
    expect(isValidTaxId("04595252")).toBe(true); // 台積電
    expect(isValidTaxId("22099131")).toBe(true); // 鴻海
    expect(isValidTaxId("12345675")).toBe(true); // 官方示例（倒數第二位為 7 特例）
  });

  it("rejects invalid checksum", () => {
    expect(isValidTaxId("12345678")).toBe(false);
    expect(isValidTaxId("00000001")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidTaxId("1234567")).toBe(false);
    expect(isValidTaxId("123456789")).toBe(false);
  });

  it("rejects non-digit", () => {
    expect(isValidTaxId("1234567A")).toBe(false);
    expect(isValidTaxId("abcdefgh")).toBe(false);
  });

  it("rejects empty / nullish", () => {
    expect(isValidTaxId("")).toBe(false);
    expect(isValidTaxId(undefined)).toBe(false);
    expect(isValidTaxId(null)).toBe(false);
  });

  // 倒數第二位為 7 的特例：sum % 5 === 0 或 (sum+1) % 5 === 0 都算合法
  it("handles the '7 at index 6' special case", () => {
    // 12345675: 倒數第二位是 7，需 (sum+1) % 5 === 0 路徑
    expect(isValidTaxId("12345675")).toBe(true);
  });
});
