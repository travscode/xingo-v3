import { ImageResponse } from "next/og";

/** Default share image for every route that doesn't define its own. Statically generated at build. */
export const alt = "XINGO — practise interpreting tests and speaking exams out loud";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em" }}>xingo</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
            Practise out loud.
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
            <span style={{ background: "#c6f432", color: "#1b2400", padding: "0 12px" }}>Pass your test.</span>
          </div>
          <div style={{ display: "flex", marginTop: 32, fontSize: 30, color: "#b3b3b3" }}>
            NAATI CCL · CPI · OET · IELTS · AMC · OSCE — AI role-play practice with scored feedback
          </div>
        </div>
      </div>
    ),
    size,
  );
}
