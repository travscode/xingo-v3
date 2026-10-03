/**
 * Branded email rendering, shared by the admin preview and Convex sending so
 * what you preview is exactly what is sent. Framework-free.
 *
 * Email-client rules followed here: table layout, inline styles only, 600px
 * container, web-safe font stack, PNG images with absolute URLs, light colour
 * scheme, hidden preheader, bulletproof (table-cell) buttons, plain-text part.
 */

export type EmailTemplateId = "announcement" | "spotlight" | "newsletter" | "letter";

export type EmailSection = {
  title: string;
  body: string;
  imageUrl?: string;
  linkLabel?: string;
  linkUrl?: string;
};

export type EmailContent = {
  kicker?: string;
  headline?: string;
  /** Markdown-lite: blank-line paragraphs, "- " bullets, "## " subheads, **bold**, *italic*, [text](url). */
  body: string;
  heroImageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sections?: EmailSection[];
  signature?: string;
};

export type EmailRenderContext = {
  siteUrl: string;
  /** Merge-tag values for {{firstName}}, {{name}}, {{email}}. */
  recipient: { firstName: string; name: string; email: string };
  unsubscribeUrl: string;
  /** Business identity shown in the footer (Spam Act 2003 sender identification). */
  senderName: string;
  senderAddress: string;
  /** Rewrites a link for click tracking. Identity in previews. */
  trackLink?: (url: string) => string;
  /** 1x1 open-tracking pixel URL. Omitted in previews. */
  openPixelUrl?: string;
};

export const emailTemplates: Array<{
  id: EmailTemplateId;
  name: string;
  description: string;
  fields: Array<"kicker" | "headline" | "heroImage" | "body" | "cta" | "sections" | "signature">;
}> = [
  {
    id: "announcement",
    name: "Announcement",
    description: "Header image, headline, message and a button. For news and launches.",
    fields: ["heroImage", "headline", "body", "cta"],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Bold black hero with a lime label. For a new feature or offer.",
    fields: ["kicker", "headline", "body", "cta"],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Intro plus up to three sections with images and links.",
    fields: ["heroImage", "headline", "body", "sections", "cta"],
  },
  {
    id: "letter",
    name: "Personal note",
    description: "Plain, personal message from you. Best deliverability.",
    fields: ["body", "cta", "signature"],
  },
];

export const defaultHeroImages = [
  { label: "Waves — dark", path: "/email/header-waves-dark.png" },
  { label: "Waves — light", path: "/email/header-waves-light.png" },
];

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const INK = "#000000";
const MUTED = "#6B6B6B";
const LINE = "#E2E2E2";
const SURFACE = "#F6F6F6";
const ACCENT = "#C6F432";
const ACCENT_INK = "#1B2400";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string) {
  return /^(https?:|mailto:)/i.test(url.trim());
}

export function applyMergeTags(text: string, recipient: EmailRenderContext["recipient"]) {
  return text
    .replace(/\{\{\s*firstName\s*\}\}/g, recipient.firstName)
    .replace(/\{\{\s*name\s*\}\}/g, recipient.name)
    .replace(/\{\{\s*email\s*\}\}/g, recipient.email);
}

function absolute(url: string, siteUrl: string) {
  return url.startsWith("/") ? `${siteUrl}${url}` : url;
}

/** Inline markdown (already HTML-escaped input). */
function inline(text: string, ctx: EmailRenderContext, linkColor = INK) {
  return text
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, url: string) => {
      const raw = url.replace(/&amp;/g, "&");
      if (!isSafeUrl(raw)) return label;
      const href = escapeHtml(ctx.trackLink ? ctx.trackLink(raw) : raw);
      return `<a href="${href}" style="color:${linkColor};font-weight:600;text-decoration:underline;">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;">$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

/** Markdown-lite to email-safe HTML blocks. */
export function markdownToEmailHtml(markdown: string, ctx: EmailRenderContext, color = INK) {
  const blocks = escapeHtml(applyMergeTags(markdown, ctx.recipient)).trim().split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split("\n");

      if (lines.every((line) => /^\s*[-•]\s+/.test(line))) {
        const items = lines
          .map((line) => line.replace(/^\s*[-•]\s+/, ""))
          .map(
            (item) =>
              `<tr><td valign="top" style="padding:0 10px 8px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${color};">&#8226;</td><td style="padding:0 0 8px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${color};">${inline(item, ctx)}</td></tr>`,
          )
          .join("");
        return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">${items}</table>`;
      }

      if (lines[0].startsWith("## ")) {
        const [head, ...rest] = lines;
        const heading = `<h2 style="margin:8px 0 8px 0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:700;color:${color};">${inline(head.slice(3), ctx)}</h2>`;
        return rest.length
          ? `${heading}<p style="margin:0 0 16px 0;font-family:${FONT};font-size:16px;line-height:26px;color:${color};">${inline(rest.join("<br>"), ctx)}</p>`
          : heading;
      }

      return `<p style="margin:0 0 16px 0;font-family:${FONT};font-size:16px;line-height:26px;color:${color};">${inline(lines.join("<br>"), ctx)}</p>`;
    })
    .join("");
}

function markdownToText(markdown: string, recipient: EmailRenderContext["recipient"]) {
  return applyMergeTags(markdown, recipient)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/^## /gm, "")
    .trim();
}

function button(label: string, url: string, ctx: EmailRenderContext, variant: "dark" | "accent" = "dark") {
  if (!label || !url || !isSafeUrl(url)) return "";
  const href = escapeHtml(ctx.trackLink ? ctx.trackLink(url) : url);
  const bg = variant === "accent" ? ACCENT : INK;
  const fg = variant === "accent" ? ACCENT_INK : "#FFFFFF";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px 0;"><tr><td bgcolor="${bg}" style="border-radius:8px;background:${bg};"><a href="${href}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:16px;font-weight:700;line-height:20px;color:${fg};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a></td></tr></table>`;
}

function image(url: string, alt: string, ctx: EmailRenderContext, radius = 12) {
  if (!url) return "";
  return `<img src="${escapeHtml(absolute(url, ctx.siteUrl))}" width="536" alt="${escapeHtml(alt)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:${radius}px;" />`;
}

function shell(inner: string, preheader: string, ctx: EmailRenderContext, opts: { logo: "black" | "white"; logoBg: string }) {
  const logo = `${ctx.siteUrl}/email/xingo-logo-${opts.logo}.png`;
  const pixel = ctx.openPixelUrl
    ? `<img src="${escapeHtml(ctx.openPixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>XINGO</title>
<style>
  @media (max-width: 620px) {
    .x-container { width: 100% !important; border-radius: 0 !important; }
    .x-pad { padding-left: 24px !important; padding-right: 24px !important; }
    .x-h1 { font-size: 28px !important; line-height: 34px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${SURFACE};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${SURFACE}" style="background:${SURFACE};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="x-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;">
<tr><td class="x-pad" bgcolor="${opts.logoBg}" style="background:${opts.logoBg};padding:24px 32px;">
<a href="${escapeHtml(ctx.trackLink ? ctx.trackLink(ctx.siteUrl) : ctx.siteUrl)}" target="_blank"><img src="${logo}" width="111" height="32" alt="XINGO" style="display:block;border:0;height:32px;width:auto;" /></a>
</td></tr>
${inner}
<tr><td class="x-pad" style="padding:24px 32px 32px 32px;border-top:1px solid ${LINE};">
<p style="margin:0 0 8px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">You're receiving this because you have a XINGO account (${escapeHtml(ctx.recipient.email)}).</p>
<p style="margin:0 0 8px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};"><a href="${escapeHtml(ctx.unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Unsubscribe from these emails</a> &nbsp;·&nbsp; <a href="${escapeHtml(ctx.siteUrl)}" style="color:${MUTED};text-decoration:underline;">xingo.ai</a></p>
<p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">${escapeHtml(ctx.senderName)} · ${escapeHtml(ctx.senderAddress)}</p>
${pixel}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const pad = (html: string, top = 32, bottom = 8) =>
  `<tr><td class="x-pad" style="padding:${top}px 32px ${bottom}px 32px;">${html}</td></tr>`;

const h1 = (text: string, color = INK) =>
  `<h1 class="x-h1" style="margin:0 0 16px 0;font-family:${FONT};font-size:32px;line-height:38px;font-weight:800;letter-spacing:-0.5px;color:${color};">${escapeHtml(text)}</h1>`;

export function renderEmail(
  templateId: EmailTemplateId,
  content: EmailContent,
  subjectPreheader: { preheader: string },
  ctx: EmailRenderContext,
): { html: string; text: string } {
  const headline = content.headline ? applyMergeTags(content.headline, ctx.recipient) : "";
  const body = markdownToEmailHtml(content.body, ctx);
  const cta = content.ctaLabel && content.ctaUrl ? button(content.ctaLabel, content.ctaUrl, ctx) : "";
  let inner = "";

  if (templateId === "announcement") {
    inner =
      (content.heroImageUrl ? pad(image(content.heroImageUrl, headline, ctx), 24, 0) : "") +
      pad(`${headline ? h1(headline) : ""}${body}${cta}`, 28, 24);
  } else if (templateId === "spotlight") {
    inner =
      `<tr><td class="x-pad" bgcolor="${INK}" style="background:${INK};padding:40px 32px 36px 32px;">` +
      (content.kicker
        ? `<span style="display:inline-block;background:${ACCENT};color:${ACCENT_INK};font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;padding:6px 10px;border-radius:6px;margin:0 0 16px 0;">${escapeHtml(content.kicker)}</span>`
        : "") +
      (headline ? h1(headline, "#FFFFFF") : "") +
      `</td></tr>` +
      pad(`${body}${content.ctaLabel && content.ctaUrl ? button(content.ctaLabel, content.ctaUrl, ctx, "dark") : ""}`, 28, 24);
  } else if (templateId === "newsletter") {
    const sections = (content.sections ?? [])
      .filter((section) => section.title || section.body)
      .map((section) => {
        const link =
          section.linkLabel && section.linkUrl && isSafeUrl(section.linkUrl)
            ? `<p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;"><a href="${escapeHtml(ctx.trackLink ? ctx.trackLink(section.linkUrl) : section.linkUrl)}" style="color:${INK};font-weight:700;text-decoration:none;">${escapeHtml(section.linkLabel)} &rarr;</a></p>`
            : "";
        return `<tr><td class="x-pad" style="padding:0 32px 8px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};"><tr><td style="padding:24px 0 16px 0;">${section.imageUrl ? `<div style="margin:0 0 16px 0;">${image(section.imageUrl, section.title, ctx, 10)}</div>` : ""}<h2 style="margin:0 0 8px 0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:700;color:${INK};">${escapeHtml(section.title)}</h2>${markdownToEmailHtml(section.body, ctx, "#333333")}${link}</td></tr></table></td></tr>`;
      })
      .join("");
    inner =
      (content.heroImageUrl ? pad(image(content.heroImageUrl, headline, ctx), 24, 0) : "") +
      pad(`${headline ? h1(headline) : ""}${body}`, 28, 8) +
      sections +
      (cta ? pad(cta, 8, 24) : "");
  } else {
    const signature = content.signature
      ? `<p style="margin:24px 0 0 0;font-family:${FONT};font-size:16px;line-height:24px;color:${INK};white-space:pre-line;">${escapeHtml(content.signature)}</p>`
      : "";
    inner = pad(`${body}${cta}${signature}`, 32, 24);
  }

  const html = shell(inner, subjectPreheader.preheader, ctx, {
    logo: templateId === "spotlight" ? "white" : "black",
    logoBg: templateId === "spotlight" ? INK : "#FFFFFF",
  });

  const text = [
    headline,
    markdownToText(content.body, ctx.recipient),
    ...(content.sections ?? []).map((section) =>
      [section.title, markdownToText(section.body, ctx.recipient), section.linkUrl ? `${section.linkLabel ?? "Read more"}: ${section.linkUrl}` : ""]
        .filter(Boolean)
        .join("\n"),
    ),
    content.ctaLabel && content.ctaUrl ? `${content.ctaLabel}: ${content.ctaUrl}` : "",
    content.signature ?? "",
    "—",
    `Unsubscribe: ${ctx.unsubscribeUrl}`,
    `${ctx.senderName} · ${ctx.senderAddress}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html, text };
}

/** Every distinct trackable URL in the content, in render order (for click reports). */
export function collectLinks(templateId: EmailTemplateId, content: EmailContent, siteUrl: string) {
  const links: string[] = [];
  renderEmail(templateId, content, { preheader: "" }, {
    siteUrl,
    recipient: { firstName: "", name: "", email: "" },
    unsubscribeUrl: "",
    senderName: "",
    senderAddress: "",
    trackLink: (url) => {
      if (!links.includes(url)) links.push(url);
      return url;
    },
  });
  return links;
}
