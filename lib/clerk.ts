function decodeClerkPublishableKeyPart(value: string) {
  const encoded = value.split("_")[2];

  if (!encoded) {
    return "";
  }

  try {
    return Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
  } catch {
    return "";
  }
}

export function getClerkIssuerDomain() {
  const explicit = process.env.CLERK_JWT_ISSUER_DOMAIN?.trim();

  if (explicit) {
    return explicit;
  }

  const decoded = decodeClerkPublishableKeyPart(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  );

  if (!decoded) {
    return "";
  }

  return decoded.startsWith("http://") || decoded.startsWith("https://")
    ? decoded
    : `https://${decoded}`;
}
