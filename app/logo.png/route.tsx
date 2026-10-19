import { ImageResponse } from "next/og";

/**
 * Square brand logo for Organization JSON-LD (lib/structured-data.ts) and anywhere a
 * raster logo is needed. Black mark on white, statically generated at build.
 */

export const dynamic = "force-static";

const SIZE = 512;

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <svg width={226} height={364} viewBox="0 0 113 182" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M75.0603 38.1001H37.5303V85.8701H75.0603V38.1001Z" fill="#000000" />
          <path d="M37.53 38.1H0V22.75C0 10.18 10.18 0 22.75 0H37.53V38.1Z" fill="#000000" />
          <path d="M112.59 38.1H75.0596V0H89.8396C102.4 0 112.59 10.18 112.59 22.75V38.1Z" fill="#000000" />
          <path
            d="M89.8503 85.8701H75.0703V181.4H89.8503C102.41 181.4 112.6 171.22 112.6 158.65V108.61C112.6 96.0501 102.42 85.8601 89.8503 85.8601V85.8701Z"
            fill="#000000"
          />
          <path d="M0 85.8701V158.66C0 171.22 10.18 181.41 22.75 181.41H37.53V85.8801H0V85.8701Z" fill="#000000" />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
