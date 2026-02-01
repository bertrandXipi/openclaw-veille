# Intégration avec second-brain

Ce document explique comment `openclaw-veille` utilise `second-brain` via une **API HTTP**.

## 🔗 Architecture

```
openclaw-veille/                 # Ce projet
├── mcp-wrapper/                 # Wrapper MCP TypeScript
│   └── src/tools/archive-url.ts # Appelle l'API HTTP
│
        │
        │ HTTP POST /archive
        ▼
second-brain/                    # Repo existant
├── batch-processor/
│   ├── src/api.js               # ← API HTTP Express
│   ├── src/notebooklm-http.js
│   ├── src/fetch-content.js
│   └── src/markdown-generator-v2.js
└── workdir/repo/                # Repo Git fiches
```

## 🚀 API HTTP de second-brain

### Endpoint: POST /archive

Archive une URL complète (fetch + NotebookLM + markdown + git).

**Request:**
```json
{
  "url": "https://news.ycombinator.com/item?id=123456",
  "tags": ["ai", "tech"],
  "note": "Intéressant",
  "source": "openclaw"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Article Title",
  "markdown_path": "fiches/2026-02/2026-02-01-article-title.md",
  "notebook_url": "https://notebooklm.google.com/notebook/abc123",
  "source_id": "source-123",
  "duration_ms": 5432
}
```

### Endpoint: GET /health

Health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T10:00:00.000Z"
}
```

## 🐳 Déploiement

### Sur Google Cloud (veille-bot)

L'API tourne sur la même instance que le bot Discord :

```bash
# Démarrer l'API
node batch-processor/src/api.js

# Ou via systemd
sudo systemctl start second-brain-api
```

### Variables d'environnement

```bash
# second-brain/.env
API_PORT=3100
REPO_PATH=./workdir/repo
NOTEBOOKLM_MCP_URL=http://127.0.0.1:8000/mcp
```

### openclaw-veille config

```bash
# openclaw-veille/.env
SECOND_BRAIN_API_URL=http://veille-bot-ip:3100
```

## 🔄 Avantages de cette Architecture

1. **Découplage** : openclaw-veille ne dépend pas du code source de second-brain
2. **Évolutivité** : L'API peut être versionnée indépendamment
3. **Testabilité** : L'API peut être mockée pour les tests
4. **Flexibilité** : D'autres clients peuvent utiliser l'API (CLI, autre bot, etc.)
5. **Maintenance** : Modifier second-brain ne casse pas openclaw-veille

## 🧪 Tests

### Tester l'API directement

```bash
curl -X POST http://localhost:3100/archive \
  -H "Content-Type: application/json" \
  -d '{"url": "https://news.ycombinator.com/item?id=123", "tags": ["test"]}'
```

### Tester via le MCP wrapper

```bash
cd openclaw-veille/mcp-wrapper
npm test
```

