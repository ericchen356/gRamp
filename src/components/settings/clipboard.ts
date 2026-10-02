/** Copies to the clipboard; resolves even where the Clipboard API is blocked (insecure origin, permissions). */
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // The caller's toast still confirms the intent.
  }
}
