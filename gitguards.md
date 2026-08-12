# Git Guardrails — Musakonttori

Nämä git-komennot on **estetty** kaikissa repossa. Rikkominen = buildi hylätään.

## Kielletyt komennot

| Komento | Estotapa | Virheviesti |
|---------|----------|-------------|
| `git restore` | Dokumentoitu kielto | Älä palauta työtiedostoja — käytä `git stash` tai branchiä |
| `git reset` | Dokumentoitu kielto | Älä resettaa committeja — käytä `git revert` |
| `git commit --no-verify` | HUSKY guard | --no-verify estetty. Korjaa hook-virheet, älä ohita niitä |
| `git push --no-verify` | HUSKY guard | --no-verify estetty. Hookit on ajettava ennen pushia |
| `git push --force` | HUSKY pre-push | Force push estetty. Rebasaa sen sijaan |
| `git push --force-with-lease` | HUSKY pre-push | Force push estetty |

## Miksi

- `git restore` — menettää muokkaamattoman työn. Käytä stash/branch.
- `git reset` — tuhoaa commit-historiaa. Käytä revert.
- `--no-verify` — kiertää kaikki turvatarkistukset. Älä käytä koskaan.
- `--force` — ylikirjoittaa etärepon historian. Älä käytä koskaan.

## Mitä tehdä jos hookki kaatuu

1. Lue virhe — hookit eivät valehtele
2. Korjaa syy: `pnpm db:generate` → `pnpm typecheck` → `pnpm test` → `pnpm build`
3. Aja uudelleen ilman lippuja
4. **Älä** käytä `--no-verify` — se ei korjaa mitään
