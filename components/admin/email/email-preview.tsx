"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { renderEmail, type EmailContent, type EmailTemplateId } from "@/lib/email/render";
import { cn } from "@/lib/utils";

/**
 * Renders the exact HTML that will be sent (same renderer as Convex), with a
 * sample recipient, in a sandboxed iframe at desktop or phone width.
 */
export function EmailPreview({
  templateId,
  content,
  subject,
  preheader,
  fromName,
  recipientName,
  recipientEmail,
}: {
  templateId: EmailTemplateId;
  content: EmailContent;
  subject: string;
  preheader: string;
  fromName: string;
  recipientName: string;
  recipientEmail: string;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const html = useMemo(() => {
    const siteUrl = typeof window === "undefined" ? "https://www.xingo.ai" : window.location.origin;
    return renderEmail(templateId, content, { preheader }, {
      siteUrl,
      recipient: { firstName: recipientName.split(" ")[0] || "there", name: recipientName, email: recipientEmail },
      unsubscribeUrl: `${siteUrl}/account`,
      senderName: "XINGO",
      senderAddress: "Your business address (set EMAIL_POSTAL_ADDRESS)",
    }).html;
  }, [content, preheader, recipientEmail, recipientName, templateId]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{subject || "(no subject)"}</p>
          <p className="truncate text-xs text-gray-500">
            {fromName || "XINGO"} · {preheader || "Preview text appears here in the inbox"}
          </p>
        </div>
        <div className="flex shrink-0 rounded-lg bg-gray-100 p-0.5">
          {(
            [
              ["desktop", Monitor],
              ["mobile", Smartphone],
            ] as const
          ).map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} preview`}
              aria-pressed={device === value}
              onClick={() => setDevice(value)}
              className={cn("rounded-md p-1.5", device === value ? "bg-paper shadow-sm" : "text-gray-500")}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-auto p-4">
        <iframe
          title="Email preview"
          sandbox=""
          srcDoc={html}
          className={cn(
            "h-[720px] rounded-lg border border-gray-200 bg-paper transition-[width]",
            device === "desktop" ? "w-full max-w-[680px]" : "w-[375px]",
          )}
        />
      </div>
    </div>
  );
}
