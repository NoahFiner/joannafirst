import { manifest, chooseVariant, loadImage } from './image-loader.js';
const category = document.body.dataset.gallery;
const front = document.querySelector('#carousel-front');
const back = document.querySelector('#carousel-back');
const previews = document.querySelector('#carousel-info-bottom');
const status = document.createElement('div');
status.className = 'image-status';
status.setAttribute('role', 'status');
const message = document.createElement('span');
const retry = document.createElement('button');
retry.textContent = 'Retry';
retry.hidden = true;
status.append(message, retry);
document.querySelector('#carousel-outer').append(status);
let items = [], requested = 0, sequence = 0;
let buttons = [];
retry.addEventListener('click', () => show(requested));
function variant(item) { return chooseVariant(item, front.clientWidth, front.clientHeight); }
async function show(index) {
  if (!items.length) return;
  requested = (index + items.length) % items.length;
  const selected = requested, token = ++sequence, item = items[selected];
  retry.hidden = true;
  message.textContent = '';
  front.setAttribute('aria-busy', 'true');
  const indicator = setTimeout(() => { if (token === sequence) message.textContent = 'Loading artwork…'; }, 250);
  try {
    const image = await loadImage(variant(item), 'high');
    if (token !== sequence) return;
    image.alt = item.description || item.title;
    image.className = 'gallery-artwork';
    front.replaceChildren(image);
    document.querySelector('#car-title').textContent = item.title;
    document.querySelector('#car-dimensions').textContent = item.dimensions;
    document.querySelector('#car-medium').textContent = item.medium;
    if (category === 'photos') back.style.backgroundImage = `url("${item.thumbnail.src}")`;
    buttons.forEach((button, i) => {
      button.classList.toggle('selected', i === selected);
      button.setAttribute('aria-pressed', String(i === selected));
    });
    message.textContent = '';
    // Sequential, low-priority lookahead; never preload the entire collection.
    if (!navigator.connection?.saveData) {
      (async () => {
        for (const offset of [1, -1]) {
          if (token !== sequence) break;
          await loadImage(variant(items[(selected + offset + items.length) % items.length]), 'low').catch(() => {});
        }
      })();
    }
  } catch {
    if (token === sequence) { message.textContent = 'Unable to load artwork. '; retry.hidden = false; }
  } finally {
    clearTimeout(indicator);
    if (token === sequence) front.setAttribute('aria-busy', 'false');
  }
}
document.querySelector('#left-arr').addEventListener('click', () => show(requested - 1));
document.querySelector('#right-arr').addEventListener('click', () => show(requested + 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); show(requested + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
try {
  items = (await manifest).filter(item => item.category === category).sort((a, b) => a.order - b.order);
  if (!items.length) throw new Error('Empty gallery');
  buttons = items.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-preview';
    button.setAttribute('aria-label', `View ${item.title}`);
    const image = document.createElement('img');
    image.src = item.thumbnail.src;
    image.alt = '';
    image.width = item.thumbnail.width;
    image.height = item.thumbnail.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    const label = document.createElement('span');
    label.className = 'preview-overlay';
    const title = document.createElement('p');
    title.textContent = item.title;
    label.append(title);
    button.append(image, label);
    button.addEventListener('click', () => show(index));
    return button;
  });
  previews.replaceChildren(...buttons);
  show(0);
} catch {
  message.textContent = 'Unable to load the gallery. Please reload the page.';
}
