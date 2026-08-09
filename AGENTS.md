# AGENTS.md — @musakonttori/accounts-next

## What this is

Next.js App Router -adapteri `musakonttori-accounts`-identiteettipalveluun: server-helperit,
sessiokäsittely ja Accounts-kutsut. Asennetaan `github:…#main` -muodossa 8 tuotteeseen.

Kirjasto, ei sovellus. Ei omaa tietokantaa, ei omaa uptimea.

## Global standards (MANDATORY)

- `../MUSAKONTTORI_AI_STANDARDS.md`
- `../MUSAKONTTORI_SECURITY_ENGINEERING_STANDARD.md`
- `../MUSAKONTTORI_ARCHITECTURE.md`

## Commands

```bash
pnpm build        # tsup → dist/
pnpm typecheck    # tsc --noEmit
```

## Key conventions

- **Blast radius**: tämä paketti on 8 tuotteen auth-polulla ja asennetaan liikkuvasta
  `#main`-branchista. Jokainen merge on tuotantomuutos jokaisessa kuluttajassa
- **Rikkoutuessa**: revert ensin, älä korjaa eteenpäin
- **Verifiointi ennen mergeä**: yksi tuote kustakin auth-mallista — Clerk-satelliitti + Accounts
  (stageflow), pelkkä Accounts (soundstage), HQ-integroitu (links)
- **Ei paikallista tokenin verifiointia** tällä hetkellä: `getSession()` kutsuu `/api/me` joka
  luvulla. Accounts-katkos kirjaa käyttäjät ulos kaikkialla — ks. `docs/architecture.md`
- **Env**: `ACCOUNTS_API_URL`, `ACCOUNTS_SERVICE_NAME`, `SERVICE_JWT_PRIVATE_KEY`
- **Avaimet**: jokaisella tuotteella oma avainpari, ei koskaan jaettua

## Ennen pushia — KAIKKI pakollisia

- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm build` → menee läpi
- [ ] Yhden kuluttajatuotteen kirjautuminen testattu tätä versiota vasten

## TypeScript — 0 virhettä (PAKOLLINEN)

> Koko ohje: `../MUSAKONTTORI_AI_STANDARDS.md` § 9.

**Tyyppivirheellinen koodi ei ole keskeneräistä, se on rikki.** Tämä ohjaa koodin
kirjoittamista, ei vain pushia.

- Tehtävä ei ole valmis ennen kuin `pnpm typecheck` (`tsc --noEmit`) antaa **0 errors**
  koko projektissa — ei vain muutetuissa tiedostoissa
- Korjaa koodi tai tyyppi. Älä vaienna virhettä
- **Kielletty**: `@ts-ignore`, `@ts-nocheck`, `as any` / `as unknown as X` virheen kiertämiseen,
  `!` non-null-assertio vaientamiseen, `strict`-asetusten löysentäminen,
  `eslint-disable @typescript-eslint/no-explicit-any` tyyppidriftin peittämiseen
- **Ainoa sallittu poikkeus**: `@ts-expect-error` + perustelu kommentissa, vain kun kolmannen
  osapuolen tyypit ovat väärin. Se hajoaa itsestään kun upstream korjaantuu — `@ts-ignore` ei
- Kirjastossa tyyppivirhe on kaksin verroin paha: se leviää jokaiseen kuluttajaan build-aikana
- Jos muutoksesi paljastavat vanhoja tyyppivirheitä: korjaa tai raportoi ne. Älä piilota
- Älä raportoi työtä valmiiksi ajamatta typecheckiä JA buildia

### Build kuuluu samaan tarkistukseen

- `pnpm build` pitää mennä läpi ennen kuin tehtävä on valmis — typecheck yksin ei riitä
- Buildi löytää sen mitä `tsc --noEmit` ei näe: Next.js route- ja PageProps-tyypit,
  `generateMetadata` / `generateStaticParams` -signatuurit, server/client-rajan rikkomukset,
  puuttuvat `"use client"` -direktiivit, dynaamiset importit ja build-aikaiset env-tarkistukset
- Järjestys: `pnpm db:generate` → `pnpm typecheck` → `pnpm test` → `pnpm build`
- Buildin kaatuessa **älä** lisää `typescript.ignoreBuildErrors`- tai `eslint.ignoreDuringBuilds`
  -lippua äläkä poista tiedostoa buildista — korjaa syy
- Jos buildi vaatii env-muuttujia joita ei ole: `SKIP_ENV_VALIDATION=1 pnpm build` ja mainitse se
  raportissa. Buildin ohittaminen kokonaan ei ole vaihtoehto

### Pushia ei saa tehdä `--no-verify`-lipulla — koskaan

`git push --no-verify` (ja `git commit --no-verify`) on kielletty poikkeuksetta.
Ei "vain tämän kerran", ei "hookki on rikki", ei "kiire". Jos pre-push-hookki
epäonnistuu:

1. Lue virhe. Se on todellinen — hookki ei valehtele
2. Korjaa syy: aja `pnpm db:generate` → `pnpm typecheck` → `pnpm test` → `pnpm build`
   käsin ja korjaa jokainen virhe
3. Jos hookki itse on rikki (väärä komento, puuttuva riippuvuus) — korjaa hookki,
   älä ohita sitä
4. Vasta kun kaikki neljä menevät läpi puhtaasti, pushaa ilman lippuja

`--no-verify` ei koskaan ole oikea vastaus epäonnistuneeseen tarkistukseen — se ei
korjaa virhettä, se vain piilottaa sen seuraavalle, joka pullaa reposta.
