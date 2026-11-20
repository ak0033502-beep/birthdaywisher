import { describe, expect, it } from "vitest";
import { safeJsonLd } from "@/components/seo/JsonLd";
import { isAllowedMediaUrl, safeEqualSecret } from "@/lib/security";
import { InvalidSlugError, sanitizeCustomSlug } from "@/lib/db";

describe("security hardening helpers", () => {
    it("safeJsonLd escapes angle brackets and ampersands to prevent </script> breakout", () => {
        const out = safeJsonLd({ reviewBody: 'Great!</script><script>evil()&more' });
        expect(out).not.toContain("</script>");
        expect(out).not.toContain("<script>");
        expect(out).toContain("\\u003c/script\\u003e");
        expect(out).toContain("\\u0026more");
        expect(JSON.parse(out)).toEqual({ reviewBody: 'Great!</script><script>evil()&more' });
    });

    it("isAllowedMediaUrl allows empty or HTTPS Cloudinary URLs and blocks untrusted schemes/hosts", () => {
        expect(isAllowedMediaUrl("")).toBe(true);
        expect(isAllowedMediaUrl(undefined)).toBe(true);
        expect(isAllowedMediaUrl("https://res.cloudinary.com/demo/image/upload/v1/birthday_wishes/pic.jpg")).toBe(true);
        expect(isAllowedMediaUrl("http://res.cloudinary.com/demo/image/upload/v1/pic.jpg")).toBe(false);
        expect(isAllowedMediaUrl("https://evil.example.com/res.cloudinary.com/pic.jpg")).toBe(false);
        expect(isAllowedMediaUrl("javascript:alert(1)")).toBe(false);
        expect(isAllowedMediaUrl("data:text/html,hello")).toBe(false);
    });

    it("sanitizeCustomSlug enforces 3..40 chars and blocks reserved words", () => {
        expect(sanitizeCustomSlug("")).toBeNull();
        expect(sanitizeCustomSlug("  Happy-Bday-Riya-2026!  ")).toBe("happy-bday-riya-2026");
        expect(() => sanitizeCustomSlug("ab")).toThrow(InvalidSlugError);
        expect(() => sanitizeCustomSlug("admin")).toThrow(InvalidSlugError);
        expect(() => sanitizeCustomSlug("login")).toThrow(InvalidSlugError);
        expect(() => sanitizeCustomSlug("official")).toThrow(InvalidSlugError);
    });

    it("safeEqualSecret compares secrets in constant time", () => {
        expect(safeEqualSecret("super-secret-token-12345", "super-secret-token-12345")).toBe(true);
        expect(safeEqualSecret("super-secret-token-12345", "super-secret-token-12346")).toBe(false);
        expect(safeEqualSecret("", "super-secret-token-12345")).toBe(false);
    });
});
