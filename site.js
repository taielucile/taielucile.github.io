(() => {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('.menu-toggle');
  const nav = header?.querySelector('#primary-nav');
  if (!button || !nav) return;
  header.dataset.navReady = 'true';
  button.hidden = false;
  const closeMenu = () => {
    button.setAttribute('aria-expanded', 'false');
    header.removeAttribute('data-menu-open');
    button.querySelector('span').textContent = '＋';
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    header.toggleAttribute('data-menu-open', open);
    button.querySelector('span').textContent = open ? '−' : '＋';
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  const desktop = matchMedia('(min-width: 761px)');
  desktop.addEventListener('change', closeMenu);
})();
