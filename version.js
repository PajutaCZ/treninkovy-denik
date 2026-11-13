(() => {
  'use strict';

  const APP_VERSION = 6;
  const $ = id => document.getElementById(id);
  const gear = $('appInfoButton');
  const dialog = $('appInfoDialog');
  const status = $('versionStatus');
  const updateButton = $('updateAppButton');
  const versionNumber = $('appVersionNumber');
  const installButton = $('installButton');
  const exportButton = $('exportButton');
  const importButton = $('importButton');
  const importFile = $('importFile');
  const storageKeys = {
    logs: 'trenink28-denik-v2',
    library: 'cviceni-katalog-v1',
    settings: 'trenink-settings-v1',
  };

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

  exportButton?.addEventListener('click', () => {
    const backup = {
      app: 'Tréninkový deník',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        logs: JSON.parse(localStorage.getItem(storageKeys.logs) || '{"logs":[]}'),
        library: JSON.parse(localStorage.getItem(storageKeys.library) || '[]'),
        settings: JSON.parse(localStorage.getItem(storageKeys.settings) || '{"sets":3,"reps":10}'),
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `treninkovy-denik-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  importButton?.addEventListener('click', () => importFile?.click());
  importFile?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const data = backup?.data;
      if (backup.app !== 'Tréninkový deník' || !data
        || !Array.isArray(data.logs?.logs)
        || !Array.isArray(data.library)
        || !data.settings || typeof data.settings !== 'object') {
        throw new Error('Neplatná záloha');
      }
      if (!window.confirm('Obnovením zálohy nahradíš tréninky, knihovnu cviků a nastavení uložené v tomto prohlížeči. Pokračovat?')) return;
      localStorage.setItem(storageKeys.logs, JSON.stringify(data.logs));
      localStorage.setItem(storageKeys.library, JSON.stringify(data.library));
      localStorage.setItem(storageKeys.settings, JSON.stringify(data.settings));
      location.reload();
    } catch (error) {
      if (error.message !== 'Neplatná záloha') window.alert('Soubor se nepodařilo načíst.');
      else window.alert('Soubor není platná záloha tréninkového deníku.');
    } finally {
      event.target.value = '';
    }
  });

  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  installButton?.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    if (installButton) installButton.hidden = true;
  });

  window.addEventListener('online', checkAppVersion);
  window.addEventListener('pageshow', () => {
    if (navigator.onLine) checkAppVersion();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) checkAppVersion();
  });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  checkAppVersion();
})();

