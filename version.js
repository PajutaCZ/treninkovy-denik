(() => {
  'use strict';

  const APP_VERSION = 1;
  const $ = id => document.getElementById(id);
  const gear = $('appInfoButton');
  const dialog = $('appInfoDialog');
  const status = $('versionStatus');
  const updateButton = $('updateAppButton');
  const versionNumber = $('appVersionNumber');

  if (versionNumber) versionNumber.textContent = `Verze ${APP_VERSION}`;

  async function checkAppVersion() {
    if (!gear || !status) return;

    try {
      const registration = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistration()
        : null;
      if (navigator.onLine && registration) await registration.update().catch(() => {});

      const response = await fetch(`./version.json?check=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) throw new Error('Kontrola verze se nezdařila');

      const latest = Number((await response.json()).version);
      if (!Number.isInteger(latest) || latest < 1) throw new Error('Neplatná verze');

      const updateAvailable = latest > APP_VERSION;
      gear.classList.toggle('update-available', updateAvailable);
      gear.setAttribute('aria-label', updateAvailable
        ? `Informace o aplikaci, dostupná verze ${latest}`
        : 'Informace o aplikaci');
      status.classList.toggle('is-update', updateAvailable);
      status.classList.toggle('is-current', !updateAvailable);
      status.textContent = updateAvailable
        ? `Je dostupná nová verze ${latest}.`
        : 'Používáš nejnovější verzi.';
      if (updateButton) updateButton.hidden = !updateAvailable;
    } catch {
      gear.classList.remove('update-available');
      gear.setAttribute('aria-label', 'Informace o aplikaci');
      status.classList.remove('is-update', 'is-current');
      status.textContent = 'Aktuálnost nelze ověřit offline.';
      if (updateButton) updateButton.hidden = true;
    }
  }

  async function updateApp() {
    if (!updateButton) return;
    updateButton.disabled = true;
    updateButton.textContent = 'Aktualizuji…';

    try {
      if (!navigator.onLine) throw new Error('offline');

      const registration = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistration()
        : null;
      if (registration) {
        const hadController = !!navigator.serviceWorker.controller;
        let resolveChange;
        const changed = new Promise(resolve => { resolveChange = resolve; });
        if (hadController) {
          navigator.serviceWorker.addEventListener('controllerchange', () => resolveChange(), { once: true });
        }
        await registration.update();
        if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        if (hadController) await Promise.race([changed, new Promise(resolve => setTimeout(resolve, 10000))]);
      }

      const url = new URL(location.href);
      url.searchParams.set('refresh', String(Date.now()));
      location.replace(url.href);
    } catch {
      updateButton.disabled = false;
      updateButton.textContent = 'Zkusit aktualizaci znovu';
      status.textContent = 'Aktualizace se nepodařila. Zkus to prosím znovu online.';
    }
  }

  gear?.addEventListener('click', () => {
    dialog?.showModal();
    checkAppVersion();
  });
  $('closeAppInfo')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  updateButton?.addEventListener('click', updateApp);

  window.addEventListener('online', checkAppVersion);
  window.addEventListener('pageshow', () => {
    if (navigator.onLine) checkAppVersion();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) checkAppVersion();
  });

  checkAppVersion();
})();

