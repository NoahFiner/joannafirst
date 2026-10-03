// Header behavior is independent of image loading and slideshow timing.
const header = document.querySelector('#header-outer');
const logo = document.querySelector('#header-logo');
logo.addEventListener('click', () => { location.href = 'index.html'; });
function updateHeader() { header.classList.toggle('shown', window.scrollY >= 500); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
