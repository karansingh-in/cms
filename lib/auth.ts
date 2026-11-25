/** Cookie value derived from the passcode, so the passcode itself never sits in the browser. */
export async function sessionToken(passcode: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${passcode}:cms`));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
