# Scene Studio — HeyGen Video Generatie

Genereer AI avatar-video's via HeyGen, rechtstreeks vanuit Claude.

---

## Optie 1 · Claude Web (aanbevolen)

Gebruik HeyGen's officiële remote MCP server — geen API-key nodig in de app zelf, alles loopt via OAuth.

### 1. Voeg de connector toe

Open Claude Web → **+** → **Connector** → **Manage Connector** → **+ Add custom connector**.

| Veld | Waarde |
|------|--------|
| Name | `HeyGen` |
| MCP server URL | `https://mcp.heygen.com/mcp/v1/` |

### 2. Authenticeer

Klik op **Connect** na het opslaan. Je wordt doorgestuurd naar HeyGen's autorisatiepagina. Keur de toegang goed om de OAuth-flow te voltooien.

### 3. Rechten (optioneel)

Zet de HeyGen-connector op **Always Allow** om herhaalde permissieprompts te vermijden.

### 4. Gebruik

Open een nieuw Claude-gesprek en geef een videogeneration-prompt:

```
Genereer een video via HeyGen MCP over het verschil tussen Skills en MCP.
```

Claude regelt avatarselectie, scriptgeneratie en videorendering via de HeyGen API. Voltooide video's zijn ook zichtbaar op de **Projects**-pagina in je HeyGen-dashboard.

### Beperkingen

| Beperking | Detail |
|-----------|--------|
| HeyGen Free Tier | Beperkte videocredits. Upgrade naar Creator-plan voor productiegebruik. |
| Claude Free Tier | Custom connectors zijn niet beschikbaar. Een betaald Claude-abonnement is vereist. |

---

## Optie 2 · Scene Studio (web app)

Een lokale editor voor het samenstellen van scripts en het versturen naar HeyGen via de REST API.

### Vereisten

- Node.js 20+
- HeyGen-account met API-sleutel ([Aanmaken](https://app.heygen.com/api))
- Vercel-account (voor deployment van de serverless proxy)

### Lokaal draaien

```bash
# Geen buildstap nodig — open index.html direct in je browser
# of gebruik de Vercel dev server voor de API-proxy:
npx vercel dev
```

Ga naar `http://localhost:3000` en plak je HeyGen API-sleutel in het rechterpaneel.

### Gebruik

1. **Script** — Plak je tekst met `[mimiek]`-tags (bijv. `[smile]`, `[neutral]`)
2. **Scenes** — Controleer en herorden de geparsde scenes
3. **Mimieken** — Upload foto's voor elke uitdrukking
4. **HeyGen API** — Vul je API-sleutel in
5. Klik **Zend naar HeyGen** — de video verschijnt in je HeyGen-dashboard

### Deployen op Vercel

```bash
npx vercel --prod
```

De serverless functies in `api/` worden automatisch herkend.

---

## Projectstructuur

```
index.html          # Scene Studio UI (React via CDN)
api/
  heygen-generate.js    # POST /api/heygen-generate
  heygen-proxy.js       # POST /api/heygen-proxy
  heygen-status.js      # POST /api/heygen-status
  heygen-video-status.js
  heygen-video-v3.js
vercel.json         # Vercel configuratie
```

## Links

- [HeyGen MCP documentatie](https://heygen-1fa696a7.mintlify.app)
- [HeyGen API Reference](https://docs.heygen.com)
- [HeyGen Developer Portal](https://app.heygen.com/api)
