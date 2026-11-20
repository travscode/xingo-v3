/**
 * Accepts only plain same-site paths ("/courses/x") for redirects such as the
 * Stripe Checkout cancel URL. Never "//host", full URLs, queries or odd characters.
 */
export function safeReturnPath(path: string | undefined | null) {
  if (!path || path.length > 200 || path.startsWith("//") || !/^\/[A-Za-z0-9\-_/]*$/.test(path)) {
    return null;
  }

  return path;
}
