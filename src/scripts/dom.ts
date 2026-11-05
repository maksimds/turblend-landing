// Small helpers the components' scripts share.

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document) {
  return root.querySelector<T>(selector);
}

export function $$<T extends Element = HTMLElement>(selector: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function el(tag: string, className?: string | null, text?: string | null) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Curly apostrophes, to match the rest of the page.
export function typeset(text: string | undefined) {
  return String(text || "").replace(/(\w)'/g, "$1’");
}

// Reads a short update aloud to screen readers, through the hidden live region
// in the signup section. It's emptied first so a repeated message is read again.
export function announce(message: string) {
  const region = $("[data-announce]");
  if (!region) return;
  region.textContent = "";
  setTimeout(() => {
    region.textContent = message;
  }, 100);
}

// Runs `update` at most once per frame while the page scrolls.
export function onScroll(update: () => void) {
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }, { passive: true });
}
