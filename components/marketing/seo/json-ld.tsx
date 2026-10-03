import { serializeJsonLd } from "@/lib/structured-data";

/** Inline schema.org JSON-LD. Server-rendered, no client JS. */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
