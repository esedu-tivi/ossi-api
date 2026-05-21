# Opettajanäkymä – backend-demo (XP + kirjautumislogit)

Nopea demo opettajan näkymälle: oppilaat opettajan ryhmistä, XP-pisteet ja kirjautumisajat.

## Muutokset

- `students.xp` – XP-palkin data (demo)
- `student_login_logs` – kirjautumisaika tallennetaan `auth-api` loginissa (vain opiskelijat)
- `GET /teachers/:teacherUserId/students-overview` – opettajan oppilaslista

## Käynnistys

```bash
cd ossi-api
npm install
npm --workspace=prisma-orm run build
npm run dev
```

Migraatio ajetaan dev-profiilissa automaattisesti. Uudelleenkäynnistyksen jälkeen Prisma-client päivittyy.

## Testaus (suoraan student-management-api)

Kontissa (tai port-forward): `http://student-management-api:3000`

```bash
# Opettajan user id (esim. seedistä tai tietokannasta)
curl http://localhost:3004/teachers/2/students-overview
```

Vastaus:

```json
{
  "status": 200,
  "success": true,
  "students": [
    {
      "id": 5,
      "firstName": "Matti",
      "lastName": "Meikäläinen",
      "email": "matti@esedulainen.fi",
      "groupId": "TVT24A",
      "xp": 120,
      "lastLoginAt": "2026-05-21T07:15:00.000Z",
      "loginLogs": [
        { "id": 12, "loggedInAt": "2026-05-21T07:15:00.000Z" }
      ]
    }
  ]
}
```

Oppilaat lajitellaan viimeisimmän kirjautumisen mukaan (uusin ensin).

## Kirjautumislogien synty

Jokainen onnistunut opiskelijan login (`POST` auth-api `/login`) luo rivin `student_login_logs`-tauluun.

## Huomio frontille

Tämä on vain REST-demo student-management-api:ssa. Front voi kutsua gatewayn kautta kun GraphQL-kenttä lisätään myöhemmin.
