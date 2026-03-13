# Developer Onboarding

Tämä ohje määrittelee peruskäytännöt uusille kehittäjille OSSI-backendiin.

## 1. Työkalut

Tarvitset:

- Git (2.40+ suositus)
- Docker / Docker Desktop
- Node.js 22.x
- npm

## 2. Git-asetukset (cross-platform)

Aja nämä kerran:

```bash
git config --global user.name "Etunimi Sukunimi"
git config --global user.email "sinun.sposti@esedu.fi"
git config --global pull.rebase true
git config --global fetch.prune true
git config --global core.editor "nano"
```

### Windows-kehittäjät (Git Bash / PowerShell)

```bash
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf warn
```

### macOS/Linux-kehittäjät

```bash
git config --global core.autocrlf input
git config --global core.eol lf
git config --global core.safecrlf warn
```

Projektissa on `.gitattributes`, joka pakottaa LF-rivinvaihdot versionhallinnassa.

## 3. Branch-käytäntö

- `main`: tuotantoläheinen ja julkaistu koodi
- `dev`: integraatiohaara aktiiviselle kehitykselle
- ominaisuudet/korjaukset aina omasta branchista, joka luodaan `dev`-haarasta

Suositeltu branch-nimeäminen:

- `feature/<ticket-id>-<lyhyt-kuvaus>`
- `fix/<ticket-id>-<lyhyt-kuvaus>`
- `chore/<lyhyt-kuvaus>`

Esimerkki:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/1234-add-student-import
```

## 4. Uuden tehtävän aloitus

1. Päivitä `dev`:
   - `git checkout dev`
   - `git pull origin dev`
2. Luo uusi branch `dev`-haarasta.
3. Tee muutos pienissä, loogisissa commit-erissä.
4. Aja vähintään relevantit testit paikallisesti.
5. Tee PR `dev`-haaraan.

## 5. Commit-käytännöt

Suositus:

- lyhyt ja kuvaava otsikko
- yksi looginen muutos per commit
- vältä "misc fixes" / "update"

Esimerkkejä:

- `fix: load DATABASE_URL correctly for prod compose env_file`
- `docs: add developer onboarding and branch workflow`

## 6. Ennen PR:ää

- `git status` on siisti (ei vahingossa mukana olevia tiedostoja)
- testit / smoke test suoritettu
- dokumentaatio päivitetty, jos behavior muuttui
- PR-kuvaus sisältää:
  - mitä muutettiin
  - miksi muutettiin
  - miten testattiin

## 7. Yleisimmät Git-tilanteet

Jos `git pull` antaa "divergent branches":

```bash
git fetch origin
git rebase origin/dev
```

Konfliktin jälkeen:

```bash
git add <tiedostot>
git rebase --continue
```

Jos haluat perua rebasen:

```bash
git rebase --abort
```
