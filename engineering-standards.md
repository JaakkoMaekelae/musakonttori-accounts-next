# Perusinsinöörisäännöt — Musakonttori

Kaikki musakonttori-projektit noudattaa näitä sääntöjä. Poikkeuksia ei ole.

## 1. Tiedostokoot — maltillisena

- Yksi tiedosto = yksi vastuu. Alle 300 riviä on hyvä.
- Tiedoston ylittäessä ~500 riviä: pilko pienempiin moduuleihin.
- Ei monoliittisia komponentteja. Pienet, testattavat, uudelleenkäytettävät palaset.

## 2. TypeScript — aina, nolla virhettä, ei any

- `tsc --noEmit` = 0 errors. Jokaisessa projektissa. Joka kerta.
- `any` — **kielletty kokonaan**. Ei funktioissa, ei muuttujissa, ei geneerisyyden kiertämiseen.
- Myös kielletyt: `as any`, `as unknown as X`, `@ts-ignore`, `@ts-nocheck`, `!` non-null-assertio.
- Kaikki pitää tyypittää eksplisiittisesti. Funktioiden parametrit ja paluuarvot — aina tyyppi.
- `strict: true` tsconfigissa.
- `unknown` > `any`. `zod` > löysä tyypitys.
- Jos et osaa tyypittää jotain — pyydä apua, älä käytä `any`.
- **Ei oikomista missään.** TypeScriptin tyypitys tehdään kunnolla joka kohdassa. Ei laiskuutta.

## 3. TypeScript — ei oikomista

- Kaikki tyypitetään kunnolla. Jokainen funktio, jokainen parametri, jokainen paluuarvo.
- Ei `as`-tyyppiväittämiä tyyppien kiertämiseen. Jos TS ei ymmärrä tyyppiä — korjaa tyypitys, älä pakota.
- Ei `any`-tyyppejä "helpottamaan". Se ei helpota — se rikkoo koko tyyppijärjestelmän.
- Generiset tyypit kirjoitetaan eksplisiittisesti, ei implisiittistä `any`:ta.
- `eslint` strict-päällä. `@typescript-eslint/no-explicit-any`: error.
- `zod`-skeemat kaikkeen ulkoiseen dataan (API vastaukset, lomakkeet, query-parametrit).

## 4. Prisma — vain ORM, ei raakaa SQL:ää

**Kielletyt metodit:**
- `db.$queryRaw` — kielletty
- `db.$queryRawUnsafe` — kielletty
- `db.$executeRaw` — kielletty
- `db.$executeRawUnsafe` — kielletty

Kaikki tietokantakyselyt tehdään Prisma ORM:llä: `db.user.findMany()`, `db.user.create()`, `db.user.update()`, jne. Ei poikkeuksia.

## 5. Uudelleenkäytettävät komponentit

- Älä copypastea komponenttia projektien välillä.
- Jos sama komponentti löytyy kahdesta projektista → se kuuluu `@musakonttori/ui`.

### musakonttori-ui — jaetut UI-komponentit

Kaikki yhteiset komponentit menevät `musakonttori-ui`-projektiin:
- Button, Input, Modal, Card, Table, Toast, Skeleton, Spinner
- Form-komponentit (FormField, FormSelect, FormCheckbox)
- Layout-komponentit (PageHeader, Sidebar, Container)
- Brand-komponentit (Logo, Footer, ThemeToggle)

**Sääntö:** Ennen kuin teet uuden komponentin — tarkista onko `@musakonttori/ui`:ssa jo vastaava. Jos ei, mieti kuuluisiko uusi komponentti sinne.

Käyttö projektissa:
```tsx
import { Button, Modal } from "@musakonttori/ui";
```

## 6. Next.js — ei build-virheiden sivuutusta

```js
// next.config.ts — PAKOLLINEN
module.exports = {
  typescript: {
    ignoreBuildErrors: false,  // Älä IKINÄ laita true
  },
  eslint: {
    ignoreDuringBuilds: false, // Älä IKINÄ laita true
  },
};
```

- `ignoreBuildErrors: false` — TS-virheet kaatavat buildin. Ei neuvoteltavissa.
- `ignoreDuringBuilds: false` — ESLint-virheet kaatavat buildin. Ei neuvoteltavissa.
- Buildin kaatuessa: **korjaa virheet**, älä säädä lippuja.

## 7. Build ja laatu — portinvartijat

Ennen pushia (HUSKY):
```
pnpm db:generate → pnpm typecheck → pnpm test → pnpm build
```

Kaikki neljä läpi ilman virheitä. Mikään ei mene rikki.

## 8. Tietoturva — erityistarkkuus pakollinen

- Tietoturva ei ole jälkikäteen lisättävä — se on osa jokaista pullaria.
- CSP-headerit pakolliset tuotannossa: `script-src 'self'`, `frame-ancestors 'none'`.
- Inputit validoidaan aina palvelimella (zod), ei luoteta clientin validointiin.
- Autentikointi Clerkin kautta, ei itse rakennettuja sessioita.
- Ympäristömuuttujat (`DATABASE_URL`, API-avaimet) ei ikinä clientille. Ei edes vahingossa.
- **Säännöllinen tietoturva-auditointi** — vähintään kerran kuussa jokaiselle projektille:
  - `pnpm audit` — riippuvuuksien haavoittuvuudet
  - Koodikatsaus tietoturvakriittisiin osiin (auth, API, tietokanta)
  - CSP-headerit ja CORS-asetukset tarkistettuna
- Älä ikinä luota käyttäjän syötteeseen. Aina validoi, aina sanitointi.
- Kaikki API-endpointit suojattuna. Ei vahingossa julkisia endpointteja.

### Kielletyt tietoturvariskit

- `dangerouslySetInnerHTML` ilman sanitointia — kielletty
- `eval()` — kielletty
- Kovat salasanat / API-avaimet koodissa — kielletty
- `http://`-urli tuotannossa — kielletty
- Client-side tietokantakutsut — kielletty
- `prisma.$queryRaw*` / `prisma.$executeRaw*` — kielletty (ks. §4)

## 9. Brändi — jokaisessa tuotteessa

- Musakonttorin brändi-identiteetti näkyy jokaisessa projektissa. Ei geneeristä ulkoasua.
- **Brändiväri:** `#BF2227` (pääväri), valkoinen + tummat taustat.
- **Komponentit:** `@musakonttori/ui` — käytä jaettuja brand-komponentteja.
- **Typografia:** Inter (headings) + Geist (body). `@musakonttori/ui` hoitaa fontit.
- **Logo:** Musakonttori-logo jokaisen tuotteen headerissa / login-sivulla.
- **Footer:** Yhtenäinen footer kaikissa tuotteissa `@musakonttori/ui`:sta.
- **Sävy:** Ammattimainen mutta lähestyttävä. Luova mutta uskottava. Suomi-englanti sekoitus OK.

## 10. Testaus — pakollinen

- Kaikesta uudesta koodista testit. Ei neuvottelua.
- **Yksikkötestit:** Kaikki util-funktiot, hookit, helperit. `vitest` tai `jest`.
- **Integraatiotestit:** API-endpointit, tietokantakyselyt, autentikaatio. Testaa oikeaa tietokantaa vasten test-ympäristössä.
- **E2E-testit:** Kriittiset käyttäjäpolut (kirjautuminen, maksu, ticket-osto). `playwright`.
- **Komponenttitestit:** UI-komponenttien renderöinti, interaktiot, saavutettavuus. `@testing-library/react`.
- Testi aina ennen kuin merkkaat työn valmiiksi. `pnpm test` läpi.

### Testikattavuus

- Util-funktiot: 100% (maksimi)
- UI-komponentit: renderöinti + perusinteraktiot (nappien klikkaus, lomakkeiden täyttö)
- API-endpointit: onnistuminen + virhetilanteet + autentikaatio
- Ei pakotettua prosenttikatetta — mutta jokainen kriittinen polku katettu.

## 11. Saavutettavuus (WCAG 2.2 AA)

- Kaikki käyttöliittymät AA-tason saavutettavuus.
- **ARIA-labelit** pakolliset: ikoneille, painikkeille ilman tekstiä, lomakkeille.
- **Näppäimistönavigaatio:** Kaikki interaktiiviset elementit focusoitavissa, Tab-järjestys looginen.
- **Kontrasti:** Tekstin ja taustan kontrastisuhde ≥ 4.5:1 (normaali), ≥ 3:1 (iso teksti).
- **Screen reader:** `alt`-tekstit kuville, semanttinen HTML (`<nav>`, `<main>`, `<article>`).
- **Lomakkeet:** Labelit yhdistetty inputteihin, virheviestit luettavissa ruudunlukijalla.
- **Väri ei ainoa keino:** Älä ilmaise tilaa pelkällä värillä. Lisää ikoni tai teksti.
- `eslint-plugin-jsx-a11y` käytössä jokaisessa projektissa.

## 12. Suorituskyky

- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- **Bundle size:** Alle 200KB gzipped per route (ensimmäinen lataus).
- **Kuvat:** `next/image` aina. WebP/AVIF-formaatit. Lazy-loading oletuksena.
- **Fontit:** `next/font` — ei Google Fonts ‑verkko-osoitteita.
- **Dynaamiset importit:** `next/dynamic` raskaille komponenteille, joita ei tarvita ensilatauksessa.
- **Server Components:** Oletus. Client-komponentteja (`"use client"`) vain kun pakko (state, eventit, selain-API:t).
- **Turhat riippuvuudet pois:** Analysoi bundle `pnpm build --analyze` (tai vastaava).
- **Middleware:** Kevyt. Ei raskaita tietokantakutsuja middlewareen.

## 13. Virheenkäsittely

- Jokaisessa projektissa `error.tsx` (error boundary) juuressa + kriittisissä reiteissä.
- **Sentry:** Kaikki tuotantoprojektit kytketty Sentryyn. Virheet → Sentry, ei konsoliin.
- **Käyttäjäystävälliset virheet:** Ei "Internal Server Error" -raakaviestejä. Selkeä virheviesti suomeksi (tai käyttäjän kielellä).
- **Try-catch:** Kaikki API-kutsut, tietokantakyselyt, tiedostokäsittelyt wrapattu try-catchiin.
- **Lataustilat:** `loading.tsx` tai Suspense jokaiselle async-reitille. Skeleton-komponentit `@musakonttori/ui`:sta.
- **Not-found:** `not-found.tsx` jokaisessa projektissa. Selkeä 404-sivu.
- **Virhelokitus:** Strukturoitu JSON-lokitus. Sisältää: timestamp, requestId, userId, virheviesti, stack trace (vain kehityksessä).

## 14. i18n — Monikielisyys

- **next-intl** jokaisessa Next.js-projektissa.
- **Oletuskieli:** Suomi (`fi`). Toinen kieli: englanti (`en`).
- **Käännösavaimet:** `messages/fi.json`, `messages/en.json`. Avaimet hierarkisesti: `"page.section.key"`.
- **Kovakoodattuja tekstejä ei sallita** — kaikki käyttöliittymätekstit käännöstiedostojen kautta.
- **Kielineuvottelu:** `accept-language`-headerista. `/[locale]/` reittirakenne.
- **Kielenvaihto:** `LanguageSwitcher`-komponentti `@musakonttori/ui`:sta.

## 15. Git-työnkulku

- **Branch-nimet:** `feat/kuvaava-nimi`, `fix/kuvaava-nimi`, `chore/kuvaava-nimi`, `refactor/kuvaava-nimi`.
- **Commit-viestit:** Conventional Commits. `feat: lisää X`, `fix: korjaa Y`, `chore: päivitä Z`.
- **PR-koko:** Max ~400 riviä muutosta. Isompi työ → pilko useampaan PR:ään.
- **PR-kuvaus:** Mitä tehty, miksi, testausohjeet, screenshotit UI-muutoksista.
- **Review:** Vähintään yksi hyväksyntä ennen mergeä. Ei itse-mergettämistä.
- **Rebase, älä merge:** `git rebase main` ennen mergeä, pidä historia siistinä.
- **Ei WIP-committeja mainiin.** Squashaa tai rebasea ennen mergeä.

## 16. API-suunnittelu

- **REST-konventiot:** `/api/[resource]` — GET (listaa), POST (luo), GET `/[id]` (hae), PATCH `/[id]` (päivitä), DELETE `/[id]` (poista).
- **Virhevastauksen muoto:** `{ error: true, message: "Selkeä viesti", code: "RESOURCE_NOT_FOUND" }`.
- **HTTP-statuskoodit:** 200 (OK), 201 (Luotu), 400 (Virheellinen pyyntö), 401 (Ei autentikoitu), 403 (Ei oikeuksia), 404 (Ei löydy), 500 (Palvelinvirhe).
- **Validointi:** Zod-skeemat jokaiselle endpointille. `input` + `output` — molemmat validoitu.
- **Paginointi:** `?page=1&limit=20`, vastauksessa `{ data, total, page, limit }`.
- **API-dokumentaatio:** OpenAPI/Scalar jokaisessa backend-projektissa.
- **Ei löysiä endpointteja.** Jokainen endpoint suojattu ja validoitu.

## 17. Monitorointi & lokitus

- **Sentry:** Kaikki tuotantoprojektit. Virheet, suorituskyky, replayt (tarvittaessa).
- **Strukturoitu lokitus:** JSON-muoto. `{ level, message, timestamp, requestId, ...metadata }`.
- **Älä lokita:** Salasanoja, API-avaimia, henkilötietoja (PII), sessiotokeneita, täysiä credit card -numeroita.
- **Lokitasot:** `error` (Sentryyn), `warn` (tarkkailuun), `info` (normaali operaatio), `debug` (vain kehityksessä).
- **Build & deploy seuranta:** Vercel/CI työkalun kautta. Buildin kesto ja deploy-status näkyvillä.

## 18. Ympäristömuuttujat

- `.env.example` **pakollinen** jokaisessa projektissa. Listaa kaikki tarvittavat muuttujat, ei arvoja.
- **`.env` ei ikinä versionhallintaan.** `.gitignore` varmistaa.
- **Client-muuttujat:** `NEXT_PUBLIC_*` — vain julkista dataa. Ei API-avaimia, ei URL:ia joilla on secret.
- **Palvelinmuuttujat:** `DATABASE_URL`, `DIRECT_URL`, API-avaimet — ei `NEXT_PUBLIC_`-prefiksiä.
- **Staging vs prod:** Eri arvot, eri tietokannat. Stagingissa testidata, prodissa oikea data.
- **Validointi:** `zod`-skeema ympäristömuuttujille (`env.ts` tai `env.mjs`). Buildi kaatuu jos puuttuu.

## 19. Riippuvuudet

- `pnpm audit` säännöllisesti — vähintään kerran kuussa, osana tietoturva-auditointia (§8).
- **Lockfile (`pnpm-lock.yaml`) aina commitoitu.** Ei `package-lock.json`-sekoitusta.
- **Major-päivitykset suunniteltuina.** Testaa ensin stagingissa, sitten tuotantoon.
- **Ei tarpeettomia riippuvuuksia.** Jos joku kirjasto tekee yhden asian — mieti voiko tehdä itse.
- **Pinned versiot patch-tasolle.** Ei `^` tai `~` ilman harkintaa.
- **Forkatut / paikalliset riippuvuudet:** `@musakonttori/*` workspace-protokollalla.

## 20. Maksut & Stripe

- **Webhook-idempotenssi:** Jokainen Stripe-webhook käsitellään idempotenttina. `event.id`-perustainen deduplikointi.
- **Testitila:** `STRIPE_SECRET_KEY` stagingissa testiavain (`sk_test_`), prodissa tuotantoavain (`sk_live_`). Älä sekoita.
- **Webhook-salaisuus:** `STRIPE_WEBHOOK_SECRET` — allekirjoituksen varmistus jokaisessa webhookissa.
- **PCI-varovaisuus:** Älä käsittele raakaa korttidataa. Stripe Elements / Checkout hoitaa PCI-kentät.
- **Refund-logiikka:** Kaikki refundit lokitettu. Refund-syy tallennettu.
- **Hinnat Prismassa:** `products`- ja `prices`-taulut synkronoitu Stripen kanssa. Ei kovakoodattuja hintoja.
- **Valuutat:** EUR oletus. Mahdolliset muut valuutat Stripen kautta, ei itse konvertoituna.

## 21. GDPR & Tietosuoja

- **Henkilötietojen käsittely:** Nimi, sähköposti, IP, puhelin — kaikki PII. Käsittele kuin salaisuus.
- **Evästebanneri:** Pakollinen. Vain välttämättömät evästeet ilman suostumusta. Markkinointievästeet opt-in.
- **Tietojen poisto-oikeus:** Käyttäjä voi pyytää tietojensa poistoa. 30 päivän määräaika toteuttaa.
- **Lokien säilytysaika:** Henkilötietoja sisältävät lokit max 90 päivää. Anonymisointi tämän jälkeen.
- **Privacy Policy:** Jokaisessa tuotteessa linkki tietosuojaselosteeseen.
- **Datan minimointi:** Älä kerää turhaa dataa. Vain se mikä on oikeasti tarpeen.
- **Datan vienti:** Käyttäjällä oikeus saada omat tietonsa koneluettavassa muodossa (JSON/CSV).

## 22. Tiedostojen käsittely

- **Audio-upload:** Max koko 500MB / tiedosto. Sallitut formaatit: WAV, FLAC, AIFF, MP3.
- **Kuvat:** Max koko 20MB. `next/image`-optimointi automaattisesti.
- **Tallennus:** S3 / Cloudflare R2. Ei paikallista levytilaa — instanssit ovat väliaikaisia.
- **CDN:** Kaikki staattinen media CDN:n kautta (Cloudflare / Vercel Edge).
- **Virus-skannaus:** Uploadit skannataan ennen tallennusta (ClamAV tai vastaava palvelu).
- **Tiedostonimet:** UUID-pohjaiset. Ei käyttäjän antamia tiedostonimiä sellaisenaan.
- **Presigned URL:** Siirtoon käytetään presigned URL:ia, ei suoraa uploadia palvelimelle.

## 23. Tietokannan migraatiot

- **Prisma Migrate:** `npx prisma migrate dev --name kuvaava_nimi`. Ei manuaalista SQL:ää.
- **Ei resetiä prodissa.** `prisma migrate reset` — ei ikinä tuotannossa.
- **Migraatiot versionhallinnassa:** `prisma/migrations/` commitoitu. Jokainen migraatio tarkistettavissa.
- **Taaksepäin yhteensopivuus:** Uusi migraatio ei saa rikkoa vanhaa koodia. Lisää sarakkeet `NULL`-sallivina ensin.
- **Seed-data:** `prisma/seed.ts` — testidata stagingiin. Ei tuotantoon vahingossa.
- **Varmuuskopiointi:** Ennen migraatiota prodissa — ota snapshot. Varaudu peruuttamaan.

## 24. Clerk Auth

- **Middleware-guardit:** `clerkMiddleware` jokaisessa projektissa. Suojatut reitit `publicRoutes`-listan ulkopuolella.
- **Roolit:** `admin`, `creator`, `customer`, `moderator`. Roolikohtaiset oikeudet organisaatiokohtaisesti.
- **Impersonointi-auditointi:** Kaikki admin-impersonoinnit lokitetaan `AdminAuditLog`-tauluun.
- **Org-konteksti:** Moniorganisaatio-tuki. Aktiivinen org aina tiedossa, ei vuoda orgien välillä.
- **Webhookit:** Clerk-webhookit (`user.created`, `user.updated`, `user.deleted`) synkronoivat Prisman `User`-tauluun.
- **Ei itse rakennettua authia.** Kaikki autentikointi Clerkin kautta. Ei omia JWT-toteutuksia.

## 25. SEO

- **Metadata:** `generateMetadata()` jokaisella sivulla. `title`, `description`, `openGraph`, `twitter`.
- **Structured Data:** JSON-LD organisaatiolle, tapahtumille, tuotteille. `@musakonttori/seo` tai inline.
- **Canonical URLs:** Jokaisella sivulla `canonical`-tag. Estää duplikaattisisältöä.
- **Sitemap:** `sitemap.ts` Next.js:ssä. Automaattinen generointi dynaamisille reiteille.
- **Robots.txt:** `robots.ts` — estä indeksointi stagingissa, salli prodissa.
- **Suorituskykyvaikutus:** SEO ja Core Web Vitals liittyvät yhteen (§12). Hidas sivu = huono SEO.
- **Hreflang:** Monikielisillä sivuilla `hreflang`-tagit kieliversioille.

## 26. Välimuisti (Caching)

- **Next.js cache:** `fetch`-kutsut oletuksena cachettu. `revalidate`-aika harkiten — staattinen data pidempään, dynaaminen lyhyesti.
- **ISR:** `revalidate` sivuille, joiden data muuttuu harvoin. Uudelleengenerointi taustalla.
- **Static:** Täysin staattiset sivut (`generateStaticParams`) — nopeimmat. Käytä kun mahdollista.
- **SSR:** `cache: 'no-store'` vain kun data on oikeasti reaaliaikaista.
- **Redis:** Käytä raskaiden tietokantakyselyiden cachettamiseen (valinnainen, harkiten).
- **Cache Invalidation:** Välimuistin tyhjennys `revalidatePath()` / `revalidateTag()` — ei hard-refreshiä.
- **Edge Cache:** Vercel Edge cache CDN-tasolla. Oikeat `Cache-Control`-headerit.

## 27. Middleware

- **Kevyt:** Middleware juoksee jokaisella pyynnöllä. Ei raskaita tietokantakutsuja.
- **Auth-guardit:** Clerk-middleware hoitaa autentikaation. Lisäroolitarkistukset route handlerissa, ei middlewareen.
- **Redirectit:** Vanhojen URL:ien redirectit middlewareen. Pysyvä redirect (308) muuttuneille reiteille.
- **Locale-detection:** `accept-language`-headerin luku middlewareen. `next-intl` middleware.
- **Bot-suojaus:** Rate-limiting middlewareen (Upstash / Vercel Edge). Brute-force esto.
- **A/B-testaus:** Split-traffic middlewareen (jos tarpeen). Cookie-pohjainen jako.

## 28. Concurrency-turva

- **Prisma-transaktiot:** `db.$transaction([...])` aina kun useampi toisiinsa liittyvä operaatio. Atomic.
- **Optimistic Concurrency Control:** `version`-kenttä Prisma-skeemassa. Päivitys kasvattaa versiota — ristiriidat havaitaan.
- **Duplicate-preventio:** Idempotenssi-avaimet webhookeille ja lomakkeille. `requestId` tai `idempotencyKey`.
- **Race condition:** `findUnique` + `update` → käytä `update` suoraan tai transaktiota. Älä lue ja kirjoita erikseen.
- **Lukot tarvittaessa:** `SELECT ... FOR UPDATE` (vain Prisma raw'n kautta — vältä, suunnittele toisin).

## 29. Äänen prosessointi

- **Formaatit:** Sisään WAV/FLAC/AIFF, ulos MP3 (320kbps) + WAV (master). FFmpegillä.
- **Taustatyöt:** Prosessointi jonon kautta (BullMQ / Inngest / Upstash). Ei requestin aikana — se aikakatkaisee.
- **Metadatan käsittely:** ISRC, BPM, avain, genre — tallennetaan strukturoituna. Ei pelkkää blobina.
- **Aaltomuoto:** Generoi aaltomuoto visualisointia varten (`wavesurfer.js` tai `audiowaveform`).
- **Progress-seuranta:** Käyttäjä näkee prosessoinnin tilan. WebSocket tai polling.
- **Queuen hallinta:** Jonon status, retry-logiikka, dead-letter-jono epäonnistuneille.

## 30. Projektikohtaiset standardit

Tarkemmat ohjeet:
- `MUSAKONTTORI_NEXTJS_ENGINEERING_STANDARD.md`
- `MUSAKONTTORI_REUSABLE_COMPONENT_STANDARD.md`
- `MUSAKONTTORI_UI_UX_PRODUCT_STANDARD.md`
- `MUSAKONTTORI_AI_STANDARDS.md`
