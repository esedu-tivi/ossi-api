# Release Checklist (Production)

Tämä checklist on OSSI backendin tuotantojulkaisulle (`ossi2.esedu.fi`) mallilla:

- GitHub Actions buildaa/pushaa imaget GHCR:ään
- deploy ajetaan manuaalisesti palvelimella VPN:n sisältä

## 1. Ennen releasea

- [ ] Olet `main`-branchissa ja viimeisin commit on mukana:
  - `git checkout main && git pull`
- [ ] Build/publish-workflow on vihreä:
  - GitHub Actions: `Publish OSSI2 images to GHCR`
- [ ] Tuotantopalvelimen `.env` on ajan tasalla (`/opt/ossi-api/.env`)
- [ ] Tarvittavat ympäristömuuttujat deploy-komentoa varten ovat tiedossa:
  - `GHCR_USERNAME`
  - `GHCR_TOKEN`
  - `GHCR_OWNER`
  - `IMAGE_TAG` (yleensä `staging`)

## 2. Deploy palvelimella (VPN)

- [ ] Kirjaudu tuotantopalvelimelle
- [ ] Päivitä repositorio:
  - `cd /opt/ossi-api && git pull`
- [ ] Aseta deploy-ympäristömuuttujat:
  - `export GHCR_USERNAME="<ghcr-user>"`
  - `export GHCR_TOKEN="<ghcr-read-token>"`
  - `export GHCR_OWNER="<github-owner>"`
  - `export IMAGE_TAG="staging"`
- [ ] Aja deploy:
  - `./deploy/deploy-on-server.sh`
- [ ] Tarvittaessa päivitä vain `ossi2`-nginx-vhost (ei pakollinen jokaisessa deployssa):
  - `export APPLY_NGINX_CONF=1 && ./deploy/deploy-on-server.sh`

## 3. Deployn jälkeiset tarkistukset

- [ ] Kontit ovat käynnissä:
  - `docker compose -f deploy/docker-compose.prod.yml ps`
- [ ] Health endpointit vastaavat:
  - `curl -fsS http://localhost:3000/health`
  - `curl -fsS http://localhost:3001/health`
  - `curl -fsS http://localhost:3002/health`
- [ ] Readiness endpointit vastaavat:
  - `curl -fsS http://localhost:3000/ready`
  - `curl -fsS http://localhost:3001/ready`
  - `curl -fsS http://localhost:3002/ready`
- [ ] API gatewayn lokissa ei ole kriittisiä virheitä:
  - `docker compose -f deploy/docker-compose.prod.yml logs --tail=100 api-gateway`
- [ ] Opiskelijahallinnan lokissa ei ole migraatio/runtime-virheitä:
  - `docker compose -f deploy/docker-compose.prod.yml logs --tail=100 student-management-api`
- [ ] Domain vastaa:
  - `curl -I http://ossi2.esedu.fi/graphql`
- [ ] Nginx-konfigi validi ja ladattu:
  - `sudo nginx -t`
  - Huom: muut domainit (`vaks.esedu.fi`, `tiketti.esedu.fi`) säilyvät, koska deploy-scripti ei oletuksena koske Nginxiin.

## 4. Smoke test (toiminnallinen)

- [ ] GraphQL introspection / peruskysely toimii gatewayn kautta
- [ ] Kirjautuminen toimii (`auth-api` kautta)
- [ ] Vähintään yksi student/teacher-kysely palauttaa odotetun datan
- [ ] Notification endpoint vastaa (`/notifications`)

## 5. Rollback (jos ongelmia)

- [ ] Vaihda `IMAGE_TAG` aiempaan toimivaan tagiin (esim. SHA-tag)
- [ ] Aja deploy-scripti uudestaan:
  - `./deploy/deploy-on-server.sh`
- [ ] Varmista, että palvelu palautui:
  - `docker compose -f deploy/docker-compose.prod.yml ps`
  - `curl -I http://ossi2.esedu.fi/graphql`

## 6. Release valmis

- [ ] Dokumentoi julkaistu commit SHA
- [ ] Dokumentoi käytetty image-tag
- [ ] Kirjaa mahdolliset poikkeamat/changelog
