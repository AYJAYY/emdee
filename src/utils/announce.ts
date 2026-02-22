/** Announce a message to screen readers via the sr-announcer live region. */
export function announce(msg: string): void {
  const el = document.getElementById("sr-announcer");
  if (!el) return;
  // Clear first so repeated identical messages still trigger the announcement
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
}
