# Musakonttori Onboarding Guide

Uuden kehittäjän pikaopas. Lue järjestyksessä.

## 1. Ymmärrä kokonaisuus (15 min)

- [[Musakonttori HQ]] — mikä tämä on ja mitkä ovat prioriteetit
- [[Ecosystem Map]] — miten tuotteet liittyvät toisiinsa
- [[Product Matrix]] — mitä mikäkin tuote osaa
- [[Shared Platform]] — mitä yhteisiä palveluita rakennetaan

## 2. Lue standardit (20 min)

- [[engineering-standards]] — 30 insinöörisääntöä, pakollinen kaikille
- [[gitguards]] — kielletyt git-komennot
- `MUSAKONTTORI_NEXTJS_ENGINEERING_STANDARD.md`
- `MUSAKONTTORI_AI_STANDARDS.md`

## 3. Käy läpi arkkitehtuuri (30 min)

- [[02 Architecture/System Overview]] — tekninen stack
- [[02 Architecture/Product Architecture]] — projektirakenne
- [[02 Architecture/Authentication]] — miten auth toimii
- [[10 Decisions/ADR-001 Shared Organization Model]]

## 4. Tutustu tuotteeseen (30 min)

Avaa oman tuotteesi dokumentaatio:
- `01 Products/<tuote>/<tuote>.md` — tuotteen yleiskuva
- `01 Products/<tuote>/<tuote> Architecture.md` — tekninen rakenne
- `01 Products/<tuote>/<tuote> Current State.md` — mikä on valmista, mikä kesken

## 5. Käynnistä projekti (15 min)

```bash
cd own_projects/musakonttori-<tuote>
pnpm install
pnpm dev
```

Jokainen projekti käynnistyy `pnpm dev`-komennolla.

## 6. Ennen pushia

Kaikki neljä läpi:
```
pnpm db:generate → pnpm typecheck → pnpm test → pnpm build
```

Husky estää pushin jos yksikin epäonnistuu. Älä käytä `--no-verify`.

## 7. Tärkeimmät linkit

- Obsidian vault: `own_projects/`
- GitHub: kaikki repos `musakonttori-*`
- Vercel: deployt production ja preview
- Sentry: virheet ja suorituskyky
- Linear: taskit

## 8. Keneltä kysyä apua

- Musakonttori HQ — koko ekosysteemin ohjaus
- Oma tuotesivu — tuotekohtainen tieto
- `engineering-standards.md` — kaikki säännöt

## 9. Templates

Käytä valmiita templateja:
- `Templates/Feature.md` — uusi feature
- `Templates/ADR.md` — arkkitehtuuripäätös
- `Templates/Meeting.md` — kokousmuistio

Pidä dokumentaatio ajan tasalla.
