import { describe, it, expect } from "vitest";
import { sanitizeInput, sanitizeWithFormatting } from "../src/util/sanitize.ts";

describe("Input Sanitization", () => {
  describe("sanitizeInput", () => {
    it("should remove script tags", () => {
      const malicious = '<script>alert("XSS")</script>Hello';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
      expect(result).toBe("Hello");
    });

    it("should remove all HTML tags", () => {
      const html = "<b>Bold</b> and <i>italic</i> text";
      const result = sanitizeInput(html);
      expect(result).toBe("Bold and italic text");
    });

    it("should remove dangerous event handlers", () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain("onerror");
      expect(result).not.toContain("alert");
    });

    it("should preserve plain text", () => {
      const text = "This is a normal message with no HTML";
      const result = sanitizeInput(text);
      expect(result).toBe(text);
    });

    it("should handle empty strings", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should remove javascript: protocol", () => {
      const malicious = '<a href="javascript:alert(1)">Click me</a>';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain("javascript:");
      expect(result).toBe("Click me");
    });
  });

  describe("sanitizeWithFormatting", () => {
    it("should allow basic formatting tags", () => {
      const formatted = "<b>Bold</b> and <i>italic</i> text";
      const result = sanitizeWithFormatting(formatted);
      expect(result).toContain("<b>");
      expect(result).toContain("<i>");
    });

    it("should still remove script tags", () => {
      const malicious = '<b>Bold</b><script>alert("XSS")</script>';
      const result = sanitizeWithFormatting(malicious);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<b>Bold</b>");
    });

    it("should allow safe links", () => {
      const link = '<a href="https://example.com">Link</a>';
      const result = sanitizeWithFormatting(link);
      expect(result).toContain('<a href="https://example.com">');
    });

    it("should remove dangerous link protocols", () => {
      const malicious = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeWithFormatting(malicious);
      expect(result).not.toContain("javascript:");
    });

    it("should remove dangerous tags even with formatting allowed", () => {
      const malicious = '<iframe src="evil.com"></iframe><b>Bold</b>';
      const result = sanitizeWithFormatting(malicious);
      expect(result).not.toContain("<iframe>");
      expect(result).toContain("<b>Bold</b>");
    });
  });
});
