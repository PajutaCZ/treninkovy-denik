# Tréninkový deník

Jednoduchá česká webová aplikace pro záznam cvičení. Otevři `index.html` v prohlížeči.

## Co aplikace umí

- kalendář se dny, ve kterých je uložený trénink
- zadávání cviku, sérií, opakování a postupně měněné váhy
- evidence cviků s kategorií, popisem a obrázky
- statistiky tréninku a základní nastavení

## Uložená data

Tréninkové záznamy a vlastní knihovna cviků se ukládají lokálně v prohlížeči. GitHub obsahuje zdrojové soubory aplikace a obrázky cviků.

## Verze aplikace

Ozubené kolečko v záhlaví otevírá informace o aplikaci. Pokud je v `version.json` novější číslo než v `version.js`, u kolečka se zobrazí červená tečka a v okně bude dostupná aktualizace.

Při vydání nové verze zvyš číslo `APP_VERSION` ve `version.js` a číslo `version` v `version.json` na stejnou hodnotu. V `index.html` změň také parametr `version.js?v=...`, aby prohlížeč načetl nový skript.

