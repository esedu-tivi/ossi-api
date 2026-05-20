# Troubleshooting

Yleisimmät ongelmat OSSI-backendin kehitysympäristössä.

---

## Prisma / tietokanta

### `Cannot find module 'prisma-orm'` tai `prisma-orm` ei löydy

Prisma-clientia ei ole generoitu eikä builtattu. Aja kerran ennen ensimmäistä `npm run dev` -komentoa:

```bash
npm --workspace=prisma-orm run build
```

Sama ongelma voi toistua, jos Prisma-skeema muuttuu — aja buildkomento uudelleen.

### Migraatiot eivät ajaudu / `db-migrations`-palvelu epäonnistuu

1. Tarkista, että `DATABASE_URL` on oikein `.env`-tiedostossa. Muodon tulee olla:
   ```
   DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"
   ```
2. Tarkista lokista mikä meni pieleen:
   ```bash
   docker compose logs db-migrations
   ```
3. Jos `db`-palvelu ei ollut terve ennen migraatioita, käynnistä stack uudelleen:
   ```bash
   npm stop && npm run dev
   ```

### `student-management-api` kaatuu käynnistyksessä

Palvelu hakee tutkintodataa ePeruste-rajapinnasta, jos tietokanta on tyhjä. Jos ePeruste-kutsu epäonnistuu (ei internet-yhteyttä tai rajapinta alas), palvelu kaatuu. Tarkista loki:

```bash
docker compose logs student-management-api
```

Jos ympäristössä ei ole pääsyä verkkoon, siemennä data paikallisesti:

```bash
npm run seed
```

### `npm run seed` epäonnistuu

- Varmista, että `npm run dev` tai ainakin `db`-palvelu on käynnissä.
- Varmista, että Prisma on builtattu: `npm --workspace=prisma-orm run build`.
- Tarkista, että `DATABASE_URL` löytyy `.env`-tiedostosta.

---

## Docker ja kontit

### `npm run dev` ei käynnisty — `.env`-tiedosto puuttuu

Docker Compose lukee `.env`-tiedoston projektin juuresta. Jos se puuttuu, ympäristömuuttujat eivät välity ja palvelut kaatuvat. Luo `.env`-tiedosto — kysy tiimiltä sisältö tai katso tarvittavat muuttujat [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md#environment-variables).

### Portti on jo varattuna — `address already in use`

Tarkista, mitkä portit ovat käytössä:

```bash
lsof -i :3000   # tai :3001, :3002, :5432, :27017
```

Pysäytä vanhat kontit ensin:

```bash
npm stop
docker compose down
```

Jos jokin muu prosessi varaa portin, tapa se tai vaihda hostiporttia väliaikaisesti `docker-compose.dev.yml`-tiedostossa.

### Muutokset eivät näy dev-modessa (TypeScript watch ei päivity)

Dev-moodissa lähdekoodi on bind-mountattu konttiin. Jos watch ei reagoi:

1. Tarkista, että tiedosto sijaitsee oikeassa hakemistossa (`src/`-kansio on mountattu, ei muut).
2. Käynnistä yksittäinen palvelu uudelleen:
   ```bash
   docker compose restart api-gateway
   ```
3. Jos ongelma jatkuu, pysäytä koko stack ja käynnistä uudelleen:
   ```bash
   npm stop && npm run dev
   ```

### Docker build-cache aiheuttaa ongelmia Prisma-skeeman muutoksen jälkeen

Pakota uudelleenrakennus ilman cachea:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
npm run dev
```

---

## Testit

### `npm test` epäonnistuu — tietokantayhteysvirhe

- Varmista, että `DATABASE_URL_TEST` on asetettu `.env`-tiedostossa. Muoto:
  ```
  DATABASE_URL_TEST="postgresql://postgres:postgres@db-test:5432/postgres"
  ```
- Testit tuovat oman `db-test`-kontin `docker-compose.test.yml`-tiedostosta — älä käytä tuotanto-/dev-tietokantaa.

### Palvelukohtaiset smoke-testit epäonnistuvat — `Cannot find module`

Aja ensin: `npm --workspace=prisma-orm run build`

### `npm test -w auth-api` jää roikkumaan

Varmista, ettei testiympäristö yritä ottaa yhteyttä ulkoisiin palveluihin. Smoke-testit on suunniteltu ajettavaksi ilman Dockeria — jos ne silti jäävät roikkumaan, tarkista testikohtainen konfiguraatio kansiosta `auth-api/`.

---

## Redis ja MongoDB

### `/ready`-endpoint palauttaa epäterveen tilan

Tarkista palvelukohtaiset lokitiedot:

```bash
docker compose logs api-gateway
docker compose logs messaging-server
docker compose logs notification-server
```

Redis-healthcheck: `redis-cli ping` tulee palauttaa `PONG`. Mongon healthcheck: `mongosh --eval "db.adminCommand('ping')"`.

Jos Redis tai Mongo ei ole terve, käynnistä ne uudelleen:

```bash
docker compose restart redis
docker compose restart mongo
```

---

## Muut

### pgAdmin ei avaudu

Osoite: `http://localhost:5433`  
Oletustunnukset: `pg@localhost.fi` / `postgres`

Lisää palvelinyhteydeksi:
- Host: `db`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

### Prisma Studio ei avaudu

```bash
npm run studio
```

Studio käynnistyy osoitteessa `http://localhost:5555`. Komento vaatii, että `db`-palvelu on käynnissä.

### JWT-virhe kirjautumisessa — `invalid signature` tai `jwt malformed`

`JWT_SECRET_KEY`-arvo `.env`-tiedostossa on joko tyhjä tai eri kuin se, jolla tokenit on allekirjoitettu. Aseta arvo `.env`-tiedostoon ja käynnistä `auth-api` uudelleen:

```bash
docker compose restart auth-api
```
