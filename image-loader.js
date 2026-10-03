// Shared by the gallery and header slideshow. This cache retains only a few decoded images.
const pending = new Map();
export const manifest = fetch('data/images.json').then(response => {
  if (!response.ok) throw new Error('Could not load the image catalog.');
  return response.json();
}).then(data => data.images);
export function chooseVariant(item, width, height, cover = false) {
  const ratio = item.variants[0].width / item.variants[0].height;
  const needed = (cover ? Math.max(width, height * ratio) : Math.min(width, height * ratio)) * Math.min(devicePixelRatio || 1, 2);
  return item.variants.find(image => image.width >= needed) || item.variants.at(-1);
}
export function loadImage(variant, priority = 'auto') {
  if (pending.has(variant.src)) {
    const entry = pending.get(variant.src);
    if (priority === 'high') entry.image.fetchPriority = 'high';
    return entry.promise;
  }
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  const promise = new Promise((resolve, reject) => {
    image.onload = async () => {
      try { await image.decode(); resolve(image); }
      catch (error) { pending.delete(variant.src); reject(error); }
    };
    image.onerror = () => { pending.delete(variant.src); reject(new Error('Image could not be loaded.')); };
    image.src = variant.src;
  });
  pending.set(variant.src, { image, promise });
  while (pending.size > 8) pending.delete(pending.keys().next().value);
  return promise;
}
