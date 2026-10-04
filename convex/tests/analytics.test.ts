import { describe, expect, it } from "vitest";
import { analyticsPath, safeRedirect } from "../../lib/analytics";

describe("analytics privacy", () => {
  it("never reports an invite token from a sign-up redirect", () => {
    expect(safeRedirect("/join/abc123secret")).toBe("/join");
  });

  it("keeps ordinary redirects without their query string", () => {
    expect(safeRedirect("/marketplace/ccl-medical?ref=x")).toBe("/marketplace/ccl-medical");
    expect(safeRedirect(null)).toBeUndefined();
  });

  it("keeps campaign params and drops Stripe session ids from page paths", () => {
    const search = new URLSearchParams("status=success&session_id=cs_test_123&utm_source=google");
    expect(analyticsPath("/billing", search)).toBe("/billing?utm_source=google");
  });
});
