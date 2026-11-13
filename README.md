# Tréninkový deník

Jednoduchá česká webová aplikace pro záznam cvičení.

## Aplikace

Otevři [Tréninkový deník](https://pajutacz.github.io/treninkovy-denik/) v prohlížeči. Aplikaci lze nainstalovat a používat offline.

## Co aplikace umí

- kalendář se dny, ve kterých je uložený trénink
- zadávání cviku, sérií, opakování a postupně měněné váhy
- evidence cviků s kategorií, popisem a obrázky
- statistiky tréninku a základní nastavení
- instalace aplikace a používání offline
- export a obnovení místní zálohy

## Uložená data

Tréninkové záznamy a vlastní knihovna cviků se ukládají lokálně v prohlížeči. V okně pod ozubeným kolečkem lze data exportovat do JSON souboru a později je obnovit. GitHub obsahuje zdrojové soubory aplikace a obrázky cviků.

## Instalace

V podporovaném prohlížeči klepni na ikonu stažení v záhlaví a potvrď instalaci. Aplikaci pak můžeš spouštět samostatně a používat offline.

## Verze aplikace

Ozubené kolečko v záhlaví otevírá informace o aplikaci. Pokud je v `version.json` novější číslo než v `version.js`, u kolečka se zobrazí červená tečka a v okně bude dostupná aktualizace.

Při vydání nové verze zvyš číslo `APP_VERSION` ve `version.js` a číslo `version` v `version.json` na stejnou hodnotu. V `index.html` změň také parametr `version.js?v=...`, aby prohlížeč načetl nový skript.

## Nasazení

Aplikace je publikovaná na [GitHub Pages](https://pajutacz.github.io/treninkovy-denik/).