import { manifest, chooseVariant, loadImage } from './image-loader.js';
const hero = document.querySelector('#intro-header-outer');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.createElement('button');
toggle.className = 'slideshow-toggle';
toggle.type = 'button';
let paused = false, items = [], remaining = [], current = 0, timer, nextPromise, scheduleVersion = 0;
const enabled = () => visible && !paused && !document.hidden && !reducedMotion.matches && !navigator.connection?.saveData;
function updateControl() {
  toggle.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.hidden = reducedMotion.matches || !!navigator.connection?.saveData;
}
function nextIndex() {
  if (!remaining.length) {
    remaining = items.map((_, i) => i).filter(i => i !== current);
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
  }
  return remaining.pop();
}
function prepare() {
  if (nextPromise || items.length < 2 || !enabled()) return;
  const index = nextIndex();
  nextPromise = loadImage(chooseVariant(items[index], hero.clientWidth, hero.clientHeight, true), 'low')
    .then(image => ({ index, image }), () => null);
}
function schedule() {
  clearTimeout(timer);
  const version = ++scheduleVersion;
  if (!enabled() || items.length < 2) return;
  prepare();
  timer = setTimeout(() => advance(version), 5000);
}
async function advance(version) {
  if (!enabled()) return;
  const result = await nextPromise;
  // A pause/hidden tab during decoding must not trigger a transition.
  if (!enabled() || version !== scheduleVersion) return;
  nextPromise = null;
  if (result) {
    const previous = hero.querySelector('.hero-image');
    // Never move a cached DOM node back into the slide stack: it may carry old z-index state.
    const incoming = result.image.cloneNode();
    incoming.style.zIndex = '1';
    incoming.className = 'hero-image hero-enter';
    incoming.alt = '';
    incoming.setAttribute('aria-hidden', 'true');
    hero.prepend(incoming);
    current = result.index;
    // Keep the old image underneath until the incoming layer is opaque.
    if (previous) {
      previous.style.zIndex = '0';
      setTimeout(() => previous.remove(), 250);
    }
  }
  schedule();
}
toggle.addEventListener('click', () => { paused = !paused; updateControl(); schedule(); });
document.addEventListener('visibilitychange', schedule);
reducedMotion.addEventListener('change', () => { updateControl(); schedule(); });
let visible = hero.getBoundingClientRect().bottom > 0;
new IntersectionObserver(entries => {
  const now = entries[0].isIntersecting;
  if (visible !== now) { visible = now; schedule(); }
}).observe(hero);
navigator.connection?.addEventListener('change', () => { updateControl(); schedule(); });
try {
  items = (await manifest).filter(item => item.category === 'homepage').sort((a, b) => a.order - b.order);
  if (items.length) {
    let image = hero.querySelector('.hero-image');
    if (image) await image.decode();
    else {
      image = await loadImage(chooseVariant(items[0], hero.clientWidth, hero.clientHeight, true), 'high');
      image.alt = '';
      image.className = 'hero-image';
      image.setAttribute('aria-hidden', 'true');
      hero.prepend(image);
    }
    hero.append(toggle);
    updateControl();
    if (items.length < 2) toggle.hidden = true;
    schedule();
  }
} catch { /* The HTML image remains visible if loading the slideshow catalog fails. */ }
