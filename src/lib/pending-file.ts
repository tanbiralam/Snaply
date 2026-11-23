// Hands a file dropped on the homepage to the tool page it opens. Module memory
// survives client-side navigation, and the file never leaves the browser.
// ponytail: lost on a hard reload, fine since the user can just drop again.
let pending: File | null = null;

export function setPendingFile(file: File) {
  pending = file;
}

/** Returns the waiting file once, then clears it. */
export function takePendingFile(): File | null {
  const file = pending;
  pending = null;
  return file;
}
